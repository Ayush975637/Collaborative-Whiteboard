// components/UserAvatar.jsx
import { useOnlineUsers } from '@/hooks/useOnlineUsers'

export default function UserAvatar({ user,isOnline}) {
  if(!user){
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={user.avatarUrl}
        alt={user.name}
        width={36}
        height={36}
        style={{ borderRadius: '50%' }}
      />
      {/* green / red dot */}
      <span style={{
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: isOnline ? '#1D9E75' : '#E24B4A',
        border: '2px solid white',
      }} />
    </div>
  )
}