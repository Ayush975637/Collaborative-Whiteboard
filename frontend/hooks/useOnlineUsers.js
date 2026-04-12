import { useEffect, useState } from 'react'
import { getSocket } from '../lib/socket'
export function useOnlineUsers(){

    const socket=getSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set())


 useEffect(() => {
    // someone came online

socket.on('online-users-snapshot', (userIds) => {
      setOnlineUsers(new Set(userIds))
    })






    socket.on('user-online', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]))
    })

    // someone went offline
    socket.on('user-offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    return () => {
      socket.off('online-users-snapshot')
      socket.off('user-online')
      socket.off('user-offline')
    }
  }, [])







  return onlineUsers


}