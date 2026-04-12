// app/history/page.jsx
'use client'
import { useUser } from '@clerk/nextjs'
import { useRoomHistory } from '@/hooks/useRoomHistory'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ─── helpers ───────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

// avatar colors cycling by index
const AV_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-800'   },
  { bg: 'bg-purple-100', text: 'text-purple-800'  },
  { bg: 'bg-green-100',  text: 'text-green-800'   },
  { bg: 'bg-orange-100', text: 'text-orange-800'  },
  { bg: 'bg-pink-100',   text: 'text-pink-800'    },
]

// ─── sub-components ────────────────────────────────────────

function RoomCard({ room, currentUserId, onClick }) {
  const isOwner  = room.createdBy?.userId === currentUserId
  const isActive = room.isActive

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:border-border/60 transition-colors duration-150"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">

          {/* room icon */}
          <div className="w-9 h-9 rounded-md border border-border/40 bg-muted flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-muted-foreground"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>

          {/* badges */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            <Badge variant={isActive ? 'default' : 'secondary'}
              className={isActive
                ? 'bg-green-100 text-green-800 hover:bg-green-100 text-[10px]'
                : 'text-[10px]'
              }
            >
              {isActive ? 'active' : 'closed'}
            </Badge>
            {isOwner && (
              <Badge variant="secondary"
                className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-[10px]"
              >
                your room
              </Badge>
            )}
          </div>
        </div>

        {/* room name */}
        <p className="font-medium text-sm mt-2 truncate">{room.name}</p>

        {/* creator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Avatar className="w-4 h-4">
            <AvatarImage src={room.createdBy?.avatarUrl} />
            <AvatarFallback className="text-[8px]">
              {getInitials(room.createdBy?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">
            {isOwner ? 'created by you' : room.createdBy?.name}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-px bg-border/50 mb-3" />

        <div className="flex items-center justify-between">

          {/* member avatars */}
          <div className="flex">
            {room.users.slice(0, 4).map((u, i) => (
              <Avatar
                key={u.userId}
                className="w-6 h-6 -ml-1.5 first:ml-0 ring-2 ring-background"
              >
                <AvatarImage src={u.avatarUrl} />
                <AvatarFallback
                  className={`text-[9px] font-medium
                    ${AV_COLORS[i % AV_COLORS.length].bg}
                    ${AV_COLORS[i % AV_COLORS.length].text}
                  `}
                >
                  {getInitials(u.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {room.users.length > 4 && (
              <div className="w-6 h-6 -ml-1.5 ring-2 ring-background rounded-full bg-muted flex items-center justify-center text-[9px] text-muted-foreground font-medium">
                +{room.users.length - 4}
              </div>
            )}
          </div>

          {/* last active */}
          <span className="text-[11px] text-muted-foreground">
            {timeAgo(room.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="w-14 h-5 rounded-full" />
        </div>
        <Skeleton className="w-32 h-4 mt-2" />
        <Skeleton className="w-24 h-3 mt-1" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-px bg-border/50 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
          <Skeleton className="w-12 h-3" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── main page ─────────────────────────────────────────────

export default function HistoryPage() {
  const { user }  = useUser()
  const router    = useRouter()
  const { rooms, loading, error } = useRoomHistory(user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium">Your boards</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Rooms you created or joined
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
          >
            + New room
          </Button>
        </div>

        {/* loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* error */}
        {error && (
          <div className="text-center py-12 text-sm text-destructive">
            Failed to load rooms — {error}
          </div>
        )}

        {/* empty */}
        {!loading && !error && rooms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No rooms yet</p>
            <Button
              variant="outline" size="sm"
              className="mt-3"
              onClick={() => router.push('/')}
            >
              Create your first room
            </Button>
          </div>
        )}

        {/* grid */}
        {!loading && !error && rooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map(room => (
              <RoomCard
                key={room.roomId}
                room={room}
                currentUserId={user?.id}
                onClick={() => router.push(`/room/${room.roomId}`)}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}