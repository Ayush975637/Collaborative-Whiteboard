const roomStates= {}
const roomUsers={}
const Room=require('./../models/Room')
const redis=require('./../lib/redis')

const saveToMongo=async(roomId,lines)=>{
    await Room.findOneAndUpdate(
        {roomId},
        {lines,updatedAt:Date.now()},
        {upsert:true}
    )
}
module.exports=(io)=>{
    io.on('connection', (socket) => {
        console.log('user connected:', socket.id)
socket.on('room-created',async({roomId,name,createdBy,users})=>{

    try{
  const existing=await Room.findOne({roomId})
  if(existing) {


    socket.userId=createdBy.userId
    socket.join(roomId)
    io.to(roomId).emit('user-online',{
        userId:createdBy.userId
    })



    return 
  }










   const room =new Room({
roomId,
      name,
      createdBy,
      users,     
      lines: [],
      isActive: true,



   })

   await room.save()


 socket.userId = createdBy.userId
    socket.join(roomId)
    io.to(roomId).emit('user-online', { userId: createdBy.userId })






       console.log(`Room created: ${roomId} by ${createdBy.name}`)







    }
catch(err){
    console.error('room-created error:', err)
    socket.emit('error', { message: 'Failed to create room' })
}





}

)


// save user to mongo 

socket.on('user-joined', async ({ roomId, user }) => {

  try {
    // Check if user already in room (reconnect case)
if (!roomId || !user) {
  return 
}



 await Room.updateOne(
      { roomId, 'users.userId': { $ne: user.userId } }, // only if NOT already in array
      { $push: { users: user } }
    )



//    const existing = await Room.findOne({
//       roomId,
//       'users.userId': user.userId
//     })

//   if (!existing) {
//       await Room.findOneAndUpdate(
//         { roomId },
//         { $push: { users: user } },
//         { new: true }
//       )
//     }

    

    socket.userId = user.userId  
    socket.join(roomId)

    // ✅ broadcast to ALL users in room — not just the one who joined
    io.to(roomId).emit('user-online', { userId: user.userId })

    console.log(`${user?.name} joined room ${roomId}`)
  

  } catch (err) {
    console.error('user-joined error:', err)
    socket.emit('error', { message: 'Failed to join room' })
  }

})






socket.on('join-room',async({roomId,username,lastStrokeIndex})=>{
    
    socket.data.roomId=roomId
    socket.data.username=username
    console.log(`user ${socket.id} joined room ${roomId} with username ${username}`)

    // add user to room 
    if(!roomUsers[roomId]){
        roomUsers[roomId]={}
    }
    roomUsers[roomId][socket.id]={username,x:0,y:0}








if(!roomStates[roomId]){


 const redisStrokes = await redis.lrange(`room:${roomId}:strokes`, 0, -1)
    if (redisStrokes.length > 0) {
      roomStates[roomId] = redisStrokes.map(s => JSON.parse(s))
    } else{
const existing=await Room.findOne({roomId})
    roomStates[roomId]=existing?.lines||[]
    }






    
    
}

 const onlineInRoom = [...io.sockets.adapter.rooms.get(roomId) || []]
    .map(socketId => io.sockets.sockets.get(socketId)?.userId)
    .filter(Boolean)

  socket.emit('online-users-snapshot', onlineInRoom)



const missedStrokes = roomStates[roomId].slice(lastStrokeIndex)




    socket.emit('canvas-state',missedStrokes)
    io.to(roomId).emit('room-users',roomUsers[roomId])


})




socket.on('draw',async({roomId,line})=>{
if(roomStates[roomId]){
    roomStates[roomId].push(line)
}
  await redis.rpush(`room:${roomId}:strokes`, JSON.stringify(line))








socket.to(roomId).emit('drawing',line)
await saveToMongo(roomId, roomStates[roomId])

})


// cursor position 
socket.on('cursor-move',({roomId,x,y})=>{
    if(roomUsers[roomId]?.[socket.id]){
        roomUsers[roomId][socket.id].x=x
        roomUsers[roomId][socket.id].y=y
    }

    socket.to(roomId).emit('cursor-update',{
        userId:socket?.id,
        username:socket?.data?.username,
        x,y
    })
}
    )




socket.on('clear-canvas', async ({ roomId }) => {
  roomStates[roomId] = []

  await Room.findOneAndUpdate(
    { roomId },
    { $set: { lines: [], updatedAt: Date.now() } }, // ✅ use $set
    { upsert: true }
  )

  io.to(roomId).emit('canvas-cleared')
})

socket.on('disconnect', () => {
const roomId=socket.data.roomId
if(roomId&&roomUsers[roomId]){
    delete roomUsers[roomId][socket.id]
    io.to(roomId).emit('user-left',socket.id)
    io.to(roomId).emit('user-offline', { userId: socket.userId })
    io.to(roomId).emit('room-users',roomUsers[roomId])
}



    console.log('user disconnected:', socket.id)


})


}


)










    }

