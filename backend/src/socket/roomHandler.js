const roomStates= {}
const roomUsers={}
const Room=require('./../models/Room')


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
// socket.on('join-room',(roomId)=>{
//     socket.join(roomId)
//     console.log(`user ${socket.id} joined room ${roomId}`)

//     if(roomStates[roomId]){
//         socket.emit('canvas-state',roomStates[roomId])
//     }
//     else{
//         roomStates[roomId]=[]
//     }
// })
socket.on('join-room',async({roomId,username})=>{
    socket.join(roomId)
    socket.data.roomId=roomId
    socket.data.username=username
    console.log(`user ${socket.id} joined room ${roomId} with username ${username}`)

    // add user to room 
    if(!roomUsers[roomId]){
        roomUsers[roomId]={}
    }
    roomUsers[roomId][socket.id]={username,x:0,y:0}


if(!roomStates[roomId]){
    // try to load from mongo
    const existing=await Room.findOne({roomId})
    roomStates[roomId]=existing?.lines||[]
}








    socket.emit('canvas-state',roomStates[roomId] || [])
    io.to(roomId).emit('room-users',roomUsers[roomId])


})




socket.on('draw',async({roomId,line})=>{
if(roomStates[roomId]){
    roomStates[roomId].push(line)
}
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



// socket.on('clear-canvas',async({roomId})=>{
//     roomStates[roomId]=[]

// await Room.findOneAndUpdate(
//     {roomId},
//     {lines:[],updatedAt:Date.now()},
//     {upsert:true}
// )




//     io.to(roomId).emit('canvas-cleared')
// })
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
    io.to(roomId).emit('room-users',roomUsers[roomId])
}



    console.log('user disconnected:', socket.id)
})


}


)










    }

