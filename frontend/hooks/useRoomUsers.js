// hooks/useRoomUsers.js — clean reusable hook
import { useState, useEffect } from 'react'
import { getRoomUsers } from '@/lib/api'
import { getSocket } from '@/lib/socket'
export function useRoomUsers(roomId) {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const socket = getSocket()
  useEffect(() => {
    if (!roomId) return

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await getRoomUsers(roomId)
        setUsers(data.users)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()


 socket.on('room-users', () => {
    
      fetchUsers()
    })


return () => {
      socket.off('room-users')
    }





  }, [roomId])

  return { users, loading, error }
}