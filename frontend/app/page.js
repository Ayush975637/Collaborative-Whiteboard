'use client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ModeToggle } from '@/components/toggleTheme'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/navbar'
export default function Home() {
  const router = useRouter()

  const createRoom = () => {
    const roomId = uuidv4()
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 ">

      {/* navbar */}
      
      
{/* 
      <h1 className="text-4xl font-bold text-orange-500">Collaborative Whiteboard</h1>
      <p className="text-gray-500">Draw together in real time</p> */}
      <main className="flex flex-col items-center justify-center min-h-screen gap-6  px-4">

        <div className="w-full fixed top-0 left-0 z-50   shadow-sm">
  <Navbar />
</div>
  <h1 className="text-3xl md:text-4xl font-bold text-orange-500 text-center">
    Collaborative Whiteboard
  </h1>
  <p className="text-gray-500 text-sm md:text-base text-center">
    Draw together in real time
  </p>
   <SignedIn>
        <button
          onClick={createRoom}
          className="bg-black text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-800 transition"
        >
          Create New Room
        </button>

 <button
          
          className="bg-black text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-800 transition"
        >
          <a href={'/history'}>  History</a>
        
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

      {/* <SignedIn>
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
      </SignedOut> */}

    </main>
  )
}