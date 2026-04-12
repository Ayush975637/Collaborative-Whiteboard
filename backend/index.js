const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')

const roomRoutes = require('./src/routes/room')

const roomHandler = require('./src/socket/roomHandler')
require('dotenv').config()
const connectDB = require('./src/lib/db')
connectDB()
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})
roomHandler(io)
app.use(cors())
app.use(express.json())

// test route
app.get('/', (req, res) => {
  res.send('Whiteboard backend running')
})
app.get('/health', (req, res) => {
  res.status(200).send('ok')
})
app.use('/api', roomRoutes)

// // socket logic
// io.on('connection', (socket) => {
//   console.log('user connected:', socket.id)

//   // socket.on('join-room', (roomId) => {
//   //   socket.join(roomId)
//   //   console.log(`user ${socket.id} joined room ${roomId}`)
//   // })

//   socket.on('disconnect', () => {
//     console.log('user disconnected:', socket.id)
//   })
// })

// connect mongo and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 8080, () => {
      console.log(`Server running on port ${process.env.PORT || 8080}`)
    })
  })
  .catch(err => console.log(err))
