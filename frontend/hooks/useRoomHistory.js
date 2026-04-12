// hooks/useRoomHistory.js
import { useState, useEffect } from 'react'

export function useRoomHistory(userId) {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchRooms = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/history/${userId}`
        )
        console.log(res);
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setRooms(data.rooms)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [userId])

  return { rooms, loading, error }
}