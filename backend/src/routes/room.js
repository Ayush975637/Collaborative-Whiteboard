const express = require('express')
const router = express.Router()
const Room = require('../models/Room')

// ✅ specific routes FIRST, dynamic routes AFTER
router.get('/rooms/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const rooms = await Room.find({
      $or: [
        { 'createdBy.userId': userId },
        { 'users.userId': userId }
      ]
    })
    .select('roomId name createdBy users isActive createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(20)

    return res.status(200).json({
      rooms: rooms || [],
      total: rooms.length,
    })

  } catch (err) {
    console.error('history error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ✅ dynamic route AFTER
router.get('/room/:roomId/users', async (req, res) => {
  try {
    const { roomId } = req.params

    const room = await Room.findOne({ roomId })
      .select('roomId name users createdBy')

    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    res.status(200).json({
      roomId: room.roomId,
      name: room.name,
      createdBy: room.createdBy,
      users: room.users,
      totalUsers: room.users.length,
    })

  } catch (err) {
    console.error('get users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router