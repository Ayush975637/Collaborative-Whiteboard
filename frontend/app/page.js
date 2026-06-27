'use client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

import Navbar from '@/components/navbar'
export default function Home() {
  const router = useRouter()

  const createRoom = () => {
    const roomId = uuidv4()
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 from-black-300 to-white-300 bg-gradient-to-br">

      {/* navbar */}
      
 
      <main className="flex flex-col items-center justify-center min-h-screen gap-6  px-4">

        <div className="w-full fixed top-0 left-0 z-50   shadow-sm">
  <Navbar />
</div>
  <h1 className="text-3xl md:text-6xl font-extrabold   shadow-black   text-center hover:tracking-wide transition-all duration-300">
    Collaborative Whiteboard
  </h1>
  <p className="text-black-500 text-xl md:text-2xl text-center">
    Draw together in real time
  </p>
   <SignedIn>
    <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={createRoom}
          className="bg-red-400 text-white font-bold px-8 py-3 rounded-xl text-lg hover:bg-red-500 transition"
        >
          Create New Room
        </button>

 <button
          
          className="bg-yellow-400 text-white font-bold px-8 py-3 rounded-xl text-lg hover:bg-yellow-500 transition"
        >
          <a href={'/history'}>  History</a>
        
        </button>
</div>


      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-black text-white px-8 py-3 rounded-xl text-lg">
            Sign In to Start
          </button>
        </SignInButton>
      </SignedOut>
</main>

     

    </main>
  )
}