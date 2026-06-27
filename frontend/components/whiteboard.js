"use client";
import { useEffect, useState, useRef, Fragment } from "react";
import { Stage, Layer } from "react-konva";
import { getSocket } from "../lib/socket";

import Cursor from "./Cursor";
import Toolbar from "./Toolbar";
import { useUser } from "@clerk/nextjs";
import ShareRoom from "./ShareRoom";
import RoomUsers from "./RoomUsers";

import { SiCanvas } from "react-icons/si";

import ShapeRender from "./shape/shapeRender";
import { Textarea } from "@/components/ui/textarea";
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

  const [mounted, setMounted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [cursors, setCursors] = useState({});
  const [color, setColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(3);
  const [tool, setTool] = useState("pen");

  const socket = getSocket();
  const stageRef = useRef(null);

  const [historyIndex, setHistoryIndex] = useState(0);
  const [history, setHistory] = useState([[]]);
  const lastElementIndex = useRef(0);

  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [typing, setTyping] = useState("nothing");
  const [input, setInput] = useState("");
  const [cord, setCord] = useState({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
  });

  const saveHistory = (newElements) => {
    const updateHistory = history.slice(0, historyIndex + 1);
    updateHistory.push(newElements);
    setHistory(updateHistory);
    setHistoryIndex(updateHistory.length - 1);
    setElements(newElements);
  };

  useEffect(() => {
    // socket.emit('join-room', roomId)
    if (!user) return;

    // when  ther person  a draw and  then emit to other user in room to see that  what he draws
    socket.on("drawing", (data) => {
      setElements((prev) => [...prev, data]);
      lastElementIndex.current += 1;
    });

    // the user thta missed strokes join after  alerady room have line

    socket.on("canvas-state", (existingElements) => {
      setElements(existingElements);
      lastElementIndex.current = existingElements.length;
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
      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
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
      lastElementIndex: lastElementIndex.current,
    });

    // on reconnect join user again  recoonect handle by build socket recoonection logic
    socket.on("reconnect", () => {
      socket.emit("join-room", {
        roomId,
        username: user?.firstName || "Anonymous",
        lastElementIndex: lastElementIndex.current,
      });
    });

    socket.on("element-updated", (element) => {
      setElements((prev) =>
        prev.map((el) => (el.id === element.id ? element : el)),
      );
    });

    socket.on("element-deleted", (Id) => {
      setElements((prev) => prev.filter((e) => e.id !== Id));
    });

    return () => {
      socket.off("drawing");
      socket.off("canvas-state");
      socket.off("cursor-update");
      socket.off("user-left");
      socket.off("canvas-cleared");
    };
  }, [roomId, user]);

  // Add this inside your MutationObserver useEffect, after setIsDark✔️✔️✔️✔️✔️
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

  // connection system for socket handle   lags in connection  ✔️✔️
  useEffect(() => {
    setMounted(true);

    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("reconnecting", () => setConnectionStatus("reconnecting"));
  }, []);

  // mobile /tablet logic for writing✔️✔️✔️
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

  // logic for computer

  // start writing  making intial point
  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }

    if (tool == "rect" && !selectedId && clickedOnEmpty) {
      console.log("rectangle started mouse down ");
      const id = crypto.randomUUID();
      const addedElement = {
        type: "rect",
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        fill: color,
        shadowBlur: 10,
        cornerRadius: 10,
        id,
      };
      const newElements = [...elements, addedElement];

      socket.emit("draw", { roomId, addedElement });

      setElements(newElements);
      saveHistory(newElements);
      setSelectedId(id);

      console.log("rectangle ke baad elemets ", elements);
    }

    if (tool == "text" && !selectedId && clickedOnEmpty) {
      const stageBox = stageRef.current.container().getBoundingClientRect();

      if (!stageBox) return;

      console.log("text started mouse down ");
      setTyping("start");
      setCord({ x: pos.x, y: pos.y, left: stageBox.left, right: stageBox.top });
      setInput("");
    }

    if (tool == "circle" && !selectedId && clickedOnEmpty) {
      console.log("circle started mouse down ");
      const id = crypto.randomUUID();
      const addedElement = {
        type: "circle",
        x: pos.x,
        y: pos.y,
        radius: 50,
        fill: color,
        id,
        stroke: "black",
        strokeWidth: 2,
      };
      const newElements = [...elements, addedElement];
      setSelectedId(id);
      setElements(newElements);
      saveHistory(newElements);
      socket.emit("draw", { roomId, addedElement });
      console.log("circle ke badd elemets ", elements);
    }
    if (tool == "arrow" && !selectedId && clickedOnEmpty) {
      console.log("arrow started mouse down ");
      const id = crypto.randomUUID();
      const addedElement = {
        type: "arrow",
        x: pos.x,
        y: pos.y,
        points: [0, 0, 100, 0],
        pointerLength: 20,
        pointerWidth: 20,
        fill: color,
        id,
        stroke: color,
        strokeWidth: 3,
      };
      const newElements = [...elements, addedElement];
      setSelectedId(id);
      setElements(newElements);
      saveHistory(newElements);
      socket.emit("draw", { roomId, addedElement });

      console.log("arrow ke baad elemets ", elements);
    }
    if (tool == "pen" && !selectedId && clickedOnEmpty) {
      console.log("line started mouse down ");
      setIsDrawing(true);

      const id = crypto.randomUUID();
      const newElements = [
        ...elements,
        {
          type: "line",
          points: [pos.x, pos.y],
          id,
          stroke: color,
          strokeWidth: brushWidth,
          lineCap: "round",
          lineJoin: "round",
        },
      ];
      // setSelectedId(id);
      // saveHistory(elements);
      setElements(newElements);
      saveHistory(newElements);
      console.log("line start point se ", elements);
    }
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

    if (!isDrawing) {
      return;
    }

    let lastLine = elements[elements.length - 1];
    if (lastLine.type != "line") {
      return;
    }
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);

    setElements((prev) =>
      prev.map((shape) => (shape.id === lastLine.id ? lastLine : shape)),
    );

    console.log("line updte cursor move ", elements);
  };

  // draw that line
  const handleMouseUp = () => {
    if (tool == "pen") {
      setIsDrawing(false);
      let addedElement = elements[elements.length - 1];
      if (addedElement.type != "line") {
        return;
      }

      socket.emit("draw", { roomId, addedElement });
    }
  };
  //  handle clear  full canvas
  const handleClear = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
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

  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const handleExport = () => {
    setTool("export");
    const uri = stageRef.current.toDataURL({
      pixelRatio: 4,
    });
    downloadURI(uri, "state.png");
  };

  const handleUndo = () => {
    setTool("undo");
    console.log("undo");
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;

    setElements(history[newIndex]);
    setHistoryIndex(newIndex);
  };

  const handleRedo = () => {
    setTool("redo");
    console.log("redo");
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;

    setHistoryIndex(newIndex);

    setElements(history[newIndex]);
  };

  const handleDelete = () => {
    const Id = selectedId;
    if (!Id) {
      return;
    }

    setElements((prev) => prev.filter((e) => e.id !== Id));
    socket.emit("element-delete", {
      roomId,
      Id,
    });

    setSelectedId(null);
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
              onClick={handleExport}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "export" ? "bg-black text-white" : "text-gray-700"}`}
            >
              📃
            </button>

            {/* <button onClick={handleRectangle} className={` px-2 py-1 rounded-lg ${shapeSelect?"bg-black text-white" : "text-gray-700"}`}>🟥</button> */}

            <button
              onClick={() => handleUndo()}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "undo" ? "bg-black text-white" : "text-gray-700"}`}
            >
              👈🏽
            </button>
            <button
              onClick={() => handleRedo()}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "redo" ? "bg-black text-white" : "text-gray-700"}`}
            >
              👉🏽
            </button>

            <button
              onClick={() => setTool("rect")}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "rect" ? "bg-black text-white" : "text-gray-700"}`}
            >
              🟥
            </button>

            <button
              onClick={() => setTool("circle")}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "circle" ? "bg-black text-white" : "text-gray-700"}`}
            >
              🟡
            </button>

            <button
              onClick={() => setTool("arrow")}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "arrow" ? "bg-black text-white" : "text-gray-700"}`}
            >
              ↗️
            </button>
            <button
              onClick={() => setTool("text")}
              className={`px-2 py-1 rounded-lg text-sm ${tool === "text" ? "bg-black text-white" : "text-gray-700"}`}
            >
              💬
            </button>

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

            {selectedId && (
              <button
                onClick={() => handleDelete()}
                className={`px-2 py-1 rounded-lg text-sm ${tool === "undo" ? "bg-black text-white" : "text-gray-700"}`}
              >
                ❌
              </button>
            )}
          </div>
        </div>

        <div className="absolute   top-6 right-1/2 hidden lg:block -translate-x-1/2 z-50 md:top-12 md:right-4 md:translate-x-0 md:bottom-auto  bg-opacity-90 p-2 rounded-xl shadow-lg max-w-[95vw] overflow-x-hidden">
          <button
            onClick={handleExport}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "export" ? "bg-black text-white" : "text-gray-700"}`}
          >
            📃
          </button>

          <button
            onClick={() => handleUndo()}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "undo" ? "bg-black text-white" : "text-gray-700"}`}
          >
            👈🏽
          </button>
          <button
            onClick={() => handleRedo()}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "redo" ? "bg-black text-white" : "text-gray-700"}`}
          >
            👉🏽
          </button>

          <button
            onClick={() => setTool("rect")}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "rect" ? "bg-black text-white" : "text-gray-700"}`}
          >
            🟥
          </button>

          <button
            onClick={() => setTool("circle")}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "circle" ? "bg-black text-white" : "text-gray-700"}`}
          >
            🟡
          </button>

          <button
            onClick={() => setTool("arrow")}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "arrow" ? "bg-black text-white" : "text-gray-700"}`}
          >
            ↗️
          </button>
          <button
            onClick={() => setTool("text")}
            className={`px-2 py-1 rounded-lg text-lg ${tool === "text" ? "bg-black text-white" : "text-gray-700"}`}
          >
            💬
          </button>

          {selectedId && (
            <button
              onClick={() => handleDelete()}
              className={`px-2 py-1 rounded-lg text-lg ${tool === "delete" ? "bg-black text-white" : "text-gray-700"}`}
            >
              ❌
            </button>
          )}
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

        {typing == "start" && tool == "text" && (
          <Textarea
            placeholder="Type..."
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              position: "absolute",
              left: cord.x,
              top: cord.y,
              width: "150px",
              height: "10px",
              fontSize: "20px",
              fontFamily: "Calibri",
              color: color,
              textAlign: "center",

              background: "transparent",
              border: "",
              outline: "none",
              resize: "none",

              overflow: "hidden",
              padding: "2px",
              margin: 0,
              zIndex: 50,

              minWidth: "2px",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                if (input.trim() === "") {
                  setTyping("nothing");
                  return;
                }

                const id = crypto.randomUUID();
                const addedElement = {
                  id,
                  type: "text",
                  x: cord.x,
                  y: cord.y,
                  text: input,
                  fontSize: 30,
                  fontFamily: "Calibri",
                  fill: color,
                };
                const newElements = [...elements, addedElement];

                setElements(newElements);
                saveHistory(newElements);

                console.log("text  ke baad", elements);

                socket.emit("draw", { roomId, addedElement });
                setSelectedId(id);

                setTyping("nothing");
                setInput("");
                setCord(null);
              }
            }}
          />
        )}

        <div style={{ position: "relative" }}>
          <Fragment>
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
                {elements.map((element, i) => (
                  <ShapeRender
                    key={element.id}
                    element={element}
                    selected={selectedId == element.id}
                    onSelect={() => {
                      console.log("selected", element.id);
                      setSelectedId(element.id);
                    }}
                    onChange={(newAttrs) => {
                      setElements((prev) =>
                        prev.map((shape) =>
                          shape.id === element.id ? newAttrs : shape,
                        ),
                      );

                      console.log("after movement  elements", elements);
                      socket.emit("element-update", {
                        roomId,
                        element: newAttrs,
                      });
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </Fragment>
        </div>
      </div>
    </div>
  );
}
