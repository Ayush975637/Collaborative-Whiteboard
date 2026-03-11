'use client'
import { useEffect, useState,useRef } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { getSocket } from '../lib/socket'
import Cursor from './Cursor'
import Toolbar from './Toolbar'
import {useUser} from  '@clerk/nextjs'
import ShareRoom from './ShareRoom'

const CURSOR_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899']


export default function Whiteboard({ roomId }) {
  const {user}=useUser()
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const lastStrokeIndex = useRef(0)
  const [lines, setLines] = useState([])
  const [mounted, setMounted] = useState(false);
  const[showShare,setShowShare]=useState(false);
  const [cursors,setCursors]=useState({})
  const [color,setColor]=useState('#000000')
  const [brushWidth,setBrushWidth]=useState(3)
  const [tool,setTool]=useState('pen')
  const [isDrawing, setIsDrawing] = useState(false)
  const socket = getSocket()
  const stageRef=useRef(null)
  console.log('socket in whiteboard:', socket.id)
  console.log('roomId in whiteboard:', roomId)
  console.log('user in whiteboard:', user)








  useEffect(() => {
    // socket.emit('join-room', roomId)
    if(!user) return ;
      
    
  console.log('emitting join-room with:', { roomId, username: user?.firstName || 'Anonymous' })
socket.emit('join-room', {
      roomId,
    
      username: user?.firstName || 'Anonymous',
      lastStrokeIndex: lastStrokeIndex.current
      
    })
    

 socket.on('reconnect', () => {
    socket.emit('join-room', {
      roomId,
      username: user?.firstName || 'Anonymous',
      lastStrokeIndex: lastStrokeIndex.current
    })
  })

    socket.on('drawing', (data) => {
      setLines(prev => [...prev, data])
      lastStrokeIndex.current += 1
    })

    socket.on('canvas-state', (existingLines) => {
      setLines(existingLines)
    })

socket.on('cursor-update',(CursorData)=>{
  setCursors(prev=>({...prev,[CursorData.userId]:CursorData}))

})

socket.on('user-left',(userId)=>{
  setCursors(prev=>{
    const updated={...prev}
    delete updated[userId]
    return updated
  })
})

socket.on('canvas-cleared',()=>{
  setLines([])




})





    return () => {
      socket.off('drawing')
      socket.off('canvas-state')
      socket.off('cursor-update')
      socket.off('user-left')
      socket.off('canvas-cleared')
    }
  }, [roomId, user])

useEffect(() => {
    setMounted(true);
   

  socket.on('connect', () => setConnectionStatus('connected'))
  socket.on('disconnect', () => setConnectionStatus('disconnected'))
  socket.on('reconnecting', () => setConnectionStatus('reconnecting'))






}, [])

// mobile /tablet logic for writing 
useEffect(()=>{
if(!mounted) return
const canvas=stageRef.current?.container()
if(!canvas) return

const preventScroll=(e)=>e.preventDefault()
canvas.addEventListener('touchstart',preventScroll,{passive:false})
canvas.addEventListener('touchmove',preventScroll,{passive:false})

return ()=>{
  canvas.removeEventListener('touchstart',preventScroll)
  canvas.removeEventListener('touchmove',preventScroll)
}



},[mounted])


// logic for computer

  const handleMouseDown = (e) => {
    setIsDrawing(true)
    const pos = e.target.getStage().getPointerPosition()

    setLines(prev => [
      ...prev,
      {
        points: [pos.x, pos.y],
        color: tool==='eraser'?'#ffffff':color,
        width: tool==='eraser'?20:brushWidth,
      }
    ])
  }

  const handleMouseMove = (e) => {

const pos=e.target.getStage().getPointerPosition()
socket.emit('cursor-move',{
  roomId,
  x:pos.x,
  y:pos.y,
})





    if (!isDrawing) return

    setLines(prev => {
      const updated = [...prev]
      const last = updated[updated.length - 1]

      updated[updated.length - 1] = {
        ...last,
        points: [...last.points, pos.x, pos.y]
      }

      return updated
    })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)

    const lastLine = lines[lines.length - 1]
    if (!lastLine) return

    socket.emit('draw', {
      roomId,
      line: lastLine
    })
  }

const handleClear=()=>{
  setLines([])
  socket.emit('clear-canvas',{roomId})
}

// mobile logic 
const handleTouchStart=(e)=>{
  e.evt.preventDefault()
  handleMouseDown(e)
}
const handleTouchMove=(e)=>{
  e.evt.preventDefault()
  handleMouseMove(e)
}
const handleTouchEnd=(e)=>{
 
  handleMouseUp()
}

const handleShareClick=()=>{
  setShowShare(prev=>!prev)

}





  return (

<div
className='relative w-screen h-screen overflow-hidden bg-white'

>

  <div className='fixed top-2 left-2 z-50 md:hidden'>
  <div className="flex flex-col gap-1 bg-white/90 p-2 rounded-xl shadow-lg">
    <button onClick={() => setTool('pen')} className={`px-2 py-1 rounded-lg text-sm ${tool === 'pen' ? 'bg-black text-white' : 'text-gray-700'}`}>✏️</button>
    <button onClick={() => setTool('eraser')} className={`px-2 py-1 rounded-lg text-sm ${tool === 'eraser' ? 'bg-black text-white' : 'text-gray-600'}`}>🧹</button>
    <button onClick={handleClear} className="px-2 py-1 rounded-lg text-sm text-red-500 hover:bg-red-50">🗑️</button>
  </div>
</div>
 
<div className='absolute bottom-15 left-1/2 -translate-x-1/2 z-50 md:top-4 md:left-4 md:translate-x-0 md:bottom-auto bg-white bg-opacity-90 p-2 rounded-xl shadow-lg max-w-[95vw] overflow-x-hidden'>
  <Toolbar
    color={color}
    onColorChange={setColor}
    width={brushWidth}
    onWidthChange={setBrushWidth}
    tool={tool}
    onToolChange={setTool}
    onClear={handleClear}
  />
</div>
<div className=' z-50 absolute top-4 right-4 md:hidden block'>
<button
onClick={()=>handleShareClick()}
className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm"
>
{showShare?'Close Share':'Share'}
</button>
</div>

{showShare && (
  <div className=' z-50 md:hidden block items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
    <ShareRoom roomId={roomId} />
  </div>
)}




    {/* RIGHT — ShareRoom */}
 <div className='absolute bottom-4 right-4 z-50 md:block hidden'>
  <ShareRoom roomId={roomId} />
</div>
{/* other user cursors */}
{Object.values(cursors).map((cursor,i)=>(
  <Cursor
  key={i}
  username={cursor.username}
  x={cursor.x}
  y={cursor.y}
color={CURSOR_COLORS[i%CURSOR_COLORS.length]}
/>
))}

{connectionStatus !== 'connected' && (
  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm">
    {connectionStatus === 'reconnecting' ? '🔄 Reconnecting...' : '❌ Connection lost'}
  </div>
)}




   <Stage
   ref={stageRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 0}
      height={typeof window !== 'undefined' ? window.innerHeight : 0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
       onTouchStart={handleTouchStart}   
  onTouchMove={handleTouchMove}     
  onTouchEnd={handleTouchEnd} 
      className="bg-white"
    >
      <Layer>
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.width}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </Layer>
    </Stage>


</div>

 
  )
}