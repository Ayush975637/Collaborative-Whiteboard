// components/RoomUsers.jsx — use it in any component
import { useRoomUsers } from '@/hooks/useRoomUsers'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import UserAvatar from './UserAvatar'
import { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
export default function RoomUsers({ roomId }) {
 const [ready, setReady] = useState(false)
  const socket = getSocket()

const onlineUsers = useOnlineUsers() 




useEffect(()=>{

if(!roomId){
    return ;
  }
  const markReady = () => setReady(true)



socket.on('canvas-state', markReady)
    socket.on('online-users-snapshot', markReady)


    socket.on('user-online', markReady)


    return () => {
      socket.off('canvas-state', markReady)
      socket.off('online-users-snapshot', markReady)
      socket.off('user-online', markReady)
    }


},[roomId])

  if (!roomId || !ready) return null


 return <RoomUsersInner roomId={roomId} onlineUsers={onlineUsers} />


 
}



function RoomUsersInner({roomId,onlineUsers}){
 
  const { users, loading, error } = useRoomUsers(roomId);
 



  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>

  return (
    <div>
      {users.map(user => (
         <UserAvatar key={user.userId} user={user}  isOnline={onlineUsers.has(user.userId)}/>
      ))}
    </div>
  )








}