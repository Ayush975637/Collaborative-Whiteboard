// components/RoomUsers.jsx — use it in any component
import { useRoomUsers } from '@/hooks/useRoomUsers'
import UserAvatar from './UserAvatar'

export default function RoomUsers({ roomId }) {
  const { users, loading, error } = useRoomUsers(roomId)

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>

  return (
    <div>
      {users.map(user => (
         <UserAvatar key={user.userId} user={user} />
      ))}
    </div>
  )
}