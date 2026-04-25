"use client";
import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getSocket } from "../lib/socket";
import { Button } from "@/components/ui/button"
import Cursor from "./Cursor";
import Toolbar from "./Toolbar";
import { useUser } from "@clerk/nextjs";
import ShareRoom from "./ShareRoom";
import RoomUsers from "./RoomUsers";
import Navbar from "./navbar";
import { ModeToggle } from "./toggleTheme";
import { SiCanvas } from "react-icons/si"
import { v4 as uuidv4 } from 'uuid'
const CURSOR_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ec4899",
];

const CANVAS_APP_NAMES = [
  "CanvasFlux",
  "SketchNova",
  "Boardlytic",
  "InkSphere",
  "DoodleForge",
  "WhiteSync",
  "CanvasDrift",
  "Scribblyx",
  "BrainSlate",
  "FlowBoard",
  "PixelChalk",
  "DraftNest",
  "IdeaCanvas",
  "SketchHive",
  "MindPadX",
  "DrawOrbit",
  "NoteLoom",
  "InkTrail",
  "BoardCraft",
  "CanvasPulse",
];

function getRandomName() {
  const randomIndex = Math.floor(Math.random() * CANVAS_APP_NAMES.length);
  return CANVAS_APP_NAMES[randomIndex];
}

export default function Whiteboard({ roomId }) {
  const [isDark, setIsDark] = useState(false);
const lastEmitRef = useRef(0);
  const { user } = useUser();
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const lastStrokeIndex = useRef(0);
  const [lines, setLines] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [cursors, setCursors] = useState({});
  const [color, setColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(3);
  const [tool, setTool] = useState("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const socket = getSocket();
  const stageRef = useRef(null);
  console.log("socket in whiteboard:", socket.id);
  console.log("roomId in whiteboard:", roomId);
  console.log("user in whiteboard:", user);

  useEffect(() => {
    // socket.emit('join-room', roomId)
    if (!user) return;

    

//     const currentUser = {
//       userId: user?.id,
//       name: user?.fullName,
//       email: user?.emailAddresses[0]?.emailAddress,
//       avatarUrl: user?.imageUrl,
//       joinedAt: new Date(),
//     };
//     const createdBy = currentUser;
// // room-created
//     socket.emit("room-created", {
//       roomId,
//       name: getRandomName(),
//       createdBy,
//       users: [createdBy],
//     });

//     // try to remove it 
//     socket.emit("user-joined", {
//       roomId,
//       user: currentUser,
//     });

//     socket.emit("join-room", {
//       roomId,

//       username: user?.firstName || "Anonymous",
//       lastStrokeIndex: lastStrokeIndex.current,
//     });


//     // on reconnect join user again  recoonect handle by build socket recoonection logic 
//     socket.on("reconnect", () => {
//       socket.emit("join-room", {
//         roomId,
//         username: user?.firstName || "Anonymous",
//         lastStrokeIndex: lastStrokeIndex.current,
//       });
//     });


// when  ther person  a draw and  then emit to other user in room to see that  what he draws
    socket.on("drawing", (data) => {
      setLines((prev) => [...prev, data]);
      lastStrokeIndex.current += 1;
    });

    // the user thta missed strokes join after  alerady room have line 

    socket.on("canvas-state", (existingLines) => {
      setLines(existingLines);
      lastStrokeIndex.current=existingLines.length
    });


// when person a move cursor  then he  emit to all user in that room i move to x ,y

    socket.on("cursor-update", (CursorData) => {
      setCursors((prev) => ({ ...prev, [CursorData.userId]: CursorData }));
    });



// when users disconnect then delete theri cusror data 
    socket.on("user-left", (userId) => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });


    // emit by backend when someone call clear canvas now all user get signal to clear their  frontend lines data 
    socket.on("canvas-cleared", () => {
      setLines([]);
    });


    const currentUser = {
      userId: user?.id,
      name: user?.fullName,
      email: user?.emailAddresses[0]?.emailAddress,
      avatarUrl: user?.imageUrl,
      joinedAt: new Date(),
    };
    const createdBy = currentUser;
// room-created
    socket.emit("room-created", {
      roomId,
      name: getRandomName(),
      createdBy,
      users: [createdBy],
    });

    // try to remove it 
    socket.emit("user-joined", {
      roomId,
      user: currentUser,
    });

    socket.emit("join-room", {
      roomId,

      username: user?.firstName || "Anonymous",
      lastStrokeIndex: lastStrokeIndex.current,
    });


    // on reconnect join user again  recoonect handle by build socket recoonection logic 
    socket.on("reconnect", () => {
      socket.emit("join-room", {
        roomId,
        username: user?.firstName || "Anonymous",
        lastStrokeIndex: lastStrokeIndex.current,
      });
    });
  


    return () => {
      socket.off("drawing");
      socket.off("canvas-state");
      socket.off("cursor-update");
      socket.off("user-left");
      socket.off("canvas-cleared");
    };
  }, [roomId, user]);


  // connection system for socket handle   lags in connection 
  useEffect(() => {
    setMounted(true);

    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("reconnecting", () => setConnectionStatus("reconnecting"));
  }, []);

  // mobile /tablet logic for writing
  useEffect(() => {
    if (!mounted) return;

    const canvas = stageRef.current?.container();
    if (!canvas) return;

    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, [mounted]);



  // Add this inside your MutationObserver useEffect, after setIsDark
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
      setColor(dark ? "#ffffff" : "#000000"); // ← add this line
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
    setColor(dark ? "#ffffff" : "#000000"); // ← and this line
    return () => observer.disconnect();
  }, []);

  // Derive bg color from isDark
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";








  // logic for computer


  // start writing  making intial point 
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    setLines((prev) => [
      ...prev,
      {
        strokeId:uuidv4(),
        points: [pos.x, pos.y],
        color: tool === "eraser" ? bgColor : color,
        // width: tool === "eraser" ? 20 : brushWidth,
        width:  brushWidth,
      },
    ]);
  };

// writing  start properly 


  const handleMouseMove = (e) => {
 
  const pos = e.target.getStage().getPointerPosition();
const now = Date.now();
if (!pos) return;

    if (now - lastEmitRef.current > 16) {
    socket.emit("cursor-move", {
      x: pos.x,
      y: pos.y,
    });

    lastEmitRef.current = now;
  }
    

 






    if (!isDrawing) return;

    setLines((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];

      updated[updated.length - 1] = {
        ...last,
        points: [...last.points, pos.x, pos.y],
      };

      return updated;
    });
  };


  // draw that line  
  const handleMouseUp = () => {
    setIsDrawing(false);

    const lastLine = lines[lines.length - 1];
    if (!lastLine) return;

    socket.emit("draw", {
      roomId,
      line: lastLine,
    });
  };
//  handle clear  full canvas 
  const handleClear = () => {
    setLines([]);
    socket.emit("clear-canvas", { roomId });
  };

  // mobile logic

  // touch start  same as  handle mouse down 
  const handleTouchStart = (e) => {
    e.evt.preventDefault();
    handleMouseDown(e);
  };

  // touch move same as handle mouse move 
  const handleTouchMove = (e) => {
    e.evt.preventDefault();
    handleMouseMove(e);
  };

  // touch end same as  handle mouse up
  const handleTouchEnd = (e) => {
    handleMouseUp();
  };

  const handleShareClick = () => {
    setShowShare((prev) => !prev);
  };

  return (

    <div>
      
    <div className="relative w-screen h-screen overflow-hidden ">
      <div className="fixed top-4 left-4 z-[100]">
  <a
    href={"/"}
    className="flex items-center gap-2 text-xl font-bold hover:scale-105 transition-transform"
  >
    <SiCanvas size={22} />
    <span>CanvasX</span>
  </a>
</div>
              
              
            

      <div className="fixed top-12 left-4 z-50 md:hidden">
        
        
        <div className="flex flex-col gap-1  p-2 rounded-xl shadow-lg">
          








          <button
            onClick={() => setTool("pen")}
            className={`px-2 py-1 rounded-lg text-sm ${tool === "pen" ? "bg-black text-white" : "text-gray-700"}`}
          >
            ✏️
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-2 py-1 rounded-lg text-sm ${tool === "eraser" ? "bg-black text-white" : "text-gray-600"}`}
          >
            🧹
          </button>
          <button
            onClick={handleClear}
            className="px-2 py-1 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 md:top-12 md:left-4 md:translate-x-0 md:bottom-auto  bg-opacity-90 p-2 rounded-xl shadow-lg max-w-[95vw] overflow-x-hidden">
      
        <Toolbar
          isDark={isDark}
          color={color}
          onColorChange={setColor}
          width={brushWidth}
          onWidthChange={setBrushWidth}
          tool={tool}
          onToolChange={setTool}
          onClear={handleClear}
        />
        <RoomUsers roomId={roomId} />
      </div>
      <div className=" z-50 absolute top-4 right-4 md:hidden block">
        <button
          onClick={() => handleShareClick()}
          className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm"
        >
          {showShare ? "Close Share" : "Share"}
        </button>
      </div>

      {showShare && (
        <div className=" z-50 md:hidden block items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ShareRoom roomId={roomId} />
        </div>
      )}

      {/* RIGHT — ShareRoom */}
      <div className="absolute bottom-4 right-4 z-50 md:block hidden">
        <ShareRoom roomId={roomId} />
      </div>


      {/* other user cursors */}
      {Object.values(cursors).map((cursor, i) => (
        <Cursor
          key={i}
          username={cursor.username}
          x={cursor.x}
          y={cursor.y}
          color={CURSOR_COLORS[i % CURSOR_COLORS.length]}
        />
      ))}
{/* coonection logic with socket server */}
      {connectionStatus !== "connected" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm">
          {connectionStatus === "reconnecting"
            ? "🔄 Reconnecting..."
            : "❌ Connection lost"}
        </div>
      )}


{/* konva   canvas system */}
      <Stage
        ref={stageRef}
        width={typeof window !== "undefined" ? window.innerWidth : 0}
        height={typeof window !== "undefined" ? window.innerHeight : 0}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ background: bgColor }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.isEraser ? bgColor : line.color}
              strokeWidth={line.width}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
    </div>
  );
}
