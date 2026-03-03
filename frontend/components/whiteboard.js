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
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')
  const lastStrokeIndex = useRef(0)
  const [lines, setLines] = useState([])
  const [cursors,setCursors]=useState({})
  const [color,setColor]=useState('#000000')
  const [brushWidth,setBrushWidth]=useState(3)
  const [tool,setTool]=useState('pen')
  const [isDrawing, setIsDrawing] = useState(false)
  const socket = getSocket()
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
  socket.on('connect', () => setConnectionStatus('connected'))
  socket.on('disconnect', () => setConnectionStatus('disconnected'))
  socket.on('reconnecting', () => setConnectionStatus('reconnecting'))
}, [])




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









  return (

<div
className='relative w-screen h-screen overflow-hidden bg-white'

>
 <div className='absolute top-4 left-4 z-50 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg'>
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

    {/* RIGHT — ShareRoom */}
    <div className='absolute top-4 right-4 z-50'>  {/* ✅ right-4 instead of left-4 */}
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
      width={typeof window !== 'undefined' ? window.innerWidth : 0}
      height={typeof window !== 'undefined' ? window.innerHeight : 0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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