'use client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  const router = useRouter()

  const createRoom = () => {
    const roomId = uuidv4()
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-50">

      {/* navbar */}
      <div className="absolute top-4 right-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <h1 className="text-4xl font-bold text-orange-500">Collaborative Whiteboard</h1>
      <p className="text-gray-500">Draw together in real time</p>

      <SignedIn>
        <button
          onClick={createRoom}
          className="bg-black text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-800 transition"
        >
          Create New Room
        </button>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-black text-white px-8 py-3 rounded-xl text-lg">
            Sign In to Start
          </button>
        </SignInButton>
      </SignedOut>

    </main>
  )
}