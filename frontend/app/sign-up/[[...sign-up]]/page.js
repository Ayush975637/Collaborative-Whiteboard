'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
export default function Page() {

const searchParams=useSearchParams();
const redirectUrl=searchParams.get('redirect_url')||'/'

  return (
    
  
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-black text-white p-16">
  
          <h1 className="text-5xl font-bold">
              Whiteboard
          </h1>
  
          <p className="mt-6 text-xl">
              Draw. Collaborate. Share ideas instantly.
          </p>
  
      </div>
  
      <div className="flex items-center justify-center">
          <SignUp 
          forceRedirectUrl={redirectUrl}
          />
      </div>
  </div>
  
    )
}