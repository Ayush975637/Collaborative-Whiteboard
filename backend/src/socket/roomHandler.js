const roomStates = {};
const roomUsers = {};
const Room = require("./../models/Room");
const redis = require("./../lib/redis");
const dirtyRooms = new Set();
const { z } = require("zod");

const roomIdSchema = z
  .string()
  .max(50, "Room Id too long")
  .regex(/^[a-zA-Z0-9-]+$/, "Invalid Room id format");

  const validateRoomId = (roomId, socket) => {
  const result = roomIdSchema.safeParse(roomId);

  if (!result.success) {
    socket.emit("error", "Invalid room ID");
    return null;
  }

  return result.data;
};

module.exports = validateRoomId;
const TTL = 60 * 60 * 12;

const batchSave = setInterval(async () => {
  for (const roomId of dirtyRooms) {
    try {
      await saveToMongo(roomId, roomStates[roomId]);
      dirtyRooms.delete(roomId);
    } catch (err) {
      console.error("batch save error", err);
    }
  }
}, 5000);

const saveToMongo = async (roomId, lines) => {
  await Room.findOneAndUpdate(
    { roomId },
    { lines, updatedAt: Date.now() },
    { upsert: true },
  );
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("user connected:", socket.id);
    socket.on("get-online-snapshot", () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const onlineInRoom = [...(io.sockets.adapter.rooms.get(roomId) || [])]
        .map((socketId) => io.sockets.sockets.get(socketId)?.userId)
        .filter(Boolean);

      // send only to this socket — not whole room
      socket.emit("online-users-snapshot", onlineInRoom);
    });
    // created-room
    socket.on("room-created", async ({ roomId, name, createdBy, users }) => {
      try {
        

        const existing = await Room.findOne({ roomId });
        if (existing) {
          socket.userId = createdBy.userId;
          socket.join(roomId);
          io.to(roomId).emit("user-online", {
            userId: createdBy.userId,
          });

          return;
        }

        const room = new Room({
          roomId,
          name,
          createdBy,
          users,
          lines: [],
          isActive: true,
        });

        await room.save();

        socket.userId = createdBy.userId;
        socket.join(roomId);
        io.to(roomId).emit("user-online", { userId: createdBy.userId });

        console.log(`Room created: ${roomId} by ${createdBy.name}`);
      } catch (err) {
        console.error("room-created error:", err);
        socket.emit("error", { message: "Failed to create room" });
      }
    });

    // save user to mongo
    // try to remove it

    socket.on("user-joined", async ({ roomId, user }) => {
      try {
        // Check if user already in room (reconnect case)
        if (!roomId || !user) {
          return;
        }
        

        await Room.updateOne(
          { roomId, "users.userId": { $ne: user.userId } }, // only if NOT already in array
          { $push: { users: user } },
        );

        socket.userId = user.userId;
        socket.join(roomId);

        // ✅ broadcast to ALL users in room — not just the one who joined
        io.to(roomId).emit("user-online", { userId: user.userId });
        const updatedRoom = await Room.findOne({ roomId }).select("users");

        io.to(roomId).emit("room-users", updatedRoom?.users || []);

        console.log(`${user?.name} joined room ${roomId}`);
      } catch (err) {
        console.error("user-joined error:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("join-room", async ({ roomId, username, lastStrokeIndex }) => {
const validRoomId = validateRoomId(roomId, socket);
if (!validRoomId) return;


      socket.data.roomId = validRoomId;
      socket.data.username = username;

      // add user to room
      //   create room users vector
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = {};
      }
      //   set data to that particular of that users
      roomUsers[roomId][socket.id] = { username, x: 0, y: 0 };

      // create room states

      if (!roomStates[roomId]) {
        const redisStrokes = await redis.lrange(
          `room:${roomId}:strokes`,
          0,
          -1,
        );
console.log("Redis strokes on join:", redisStrokes.map(JSON.parse));



        if (redisStrokes.length > 0) {
          roomStates[roomId] = redisStrokes.map((s) => JSON.parse(s));
        } else {
          const existing = await Room.findOne({ roomId });
          roomStates[roomId] = existing?.lines || [];
        }
      }

      //   give online users userId  in that room
      const onlineInRoom = [...(io.sockets.adapter.rooms.get(roomId) || [])]
        .map((socketId) => io.sockets.sockets.get(socketId)?.userId)
        .filter(Boolean);

      socket.emit("online-users-snapshot", onlineInRoom);

      // missed strokes  for that user that  enter   room that have alerady draw some ines
      const missedStrokes = roomStates[roomId].slice(lastStrokeIndex);

      socket.emit("canvas-state", missedStrokes);

      io.to(roomId).emit("room-users", roomUsers[roomId]);
    });
    // line draw handle mouse up
    socket.on("draw", async ({ roomId, line }) => {

 roomId=socket.data.roomId;
 if(!roomId) return;




      if (roomStates[roomId]) {
        roomStates[roomId].push(line);
      }
      const key = `room:${roomId}:strokes`;
      const exists = await redis.exists(key);

      await redis.rpush(`room:${roomId}:strokes`, JSON.stringify(line));
      const data = await redis.lrange(key, 0, -1);
      console.log("Redis strokes:", data.map(JSON.parse));
      if (!exists) {
        await redis.expire(key, TTL);
        console.log(`Set TTL for ${key} to ${TTL} seconds`);
      }
      socket.to(roomId).emit("drawing", line);
      dirtyRooms.add(roomId);
    });

    // cursor position
    socket.on("cursor-move", ({ roomId, x, y }) => {
       roomId = socket.data.roomId;
  if (!roomId) return;
      if (roomUsers[roomId]?.[socket.id]) {
        roomUsers[roomId][socket.id].x = x;
        roomUsers[roomId][socket.id].y = y;
      }

      socket.to(roomId).emit("cursor-update", {
        userId: socket?.id,
        username: socket?.data?.username,
        x,
        y,
      });
    });

    // handle clear function in frontend
    socket.on("clear-canvas", async ({ roomId }) => {

 roomId = socket.data.roomId;
  if (!roomId) return;

      roomStates[roomId] = [];

      await Room.findOneAndUpdate(
        { roomId },
        { $set: { lines: [], updatedAt: Date.now() } }, // ✅ use $set
        { upsert: true },
      );

      io.to(roomId).emit("canvas-cleared");
    });

    // diconnect system
    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (roomId && roomUsers[roomId]) {
        delete roomUsers[roomId][socket.id];
        io.to(roomId).emit("user-left", socket.id);
        io.to(roomId).emit("user-offline", { userId: socket.userId });
        io.to(roomId).emit("room-users", roomUsers[roomId]);
      }

      console.log("user disconnected:", socket.id);
    });
  });
};
