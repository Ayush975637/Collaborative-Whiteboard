'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { FaRegMoon } from "react-icons/fa"
import { SiCanvas } from "react-icons/si"
import { IoMdSunny } from "react-icons/io"

const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // only renders on client — never on server
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4">

      {/* Logo */}
      <Button
        variant="ghost"
        className="text-xl font-bold flex items-center cursor-pointer hover:text-2xl transition-colors duration-300"
      >
        <a className="flex flex-row items-center" href="/">
          <SiCanvas size={20} className="mr-2 text-xl hover:text-2xl" />
          CanvasX
        </a>
      </Button>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* ✅ only render Clerk components after client mounts */}
        {mounted ? (
          <>
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
          </>
        ) : (
          // ✅ placeholder same size as UserButton — prevents layout shift
          <div className="w-8 h-8 rounded-full bg-muted" />
        )}

        {/* ✅ theme toggle also needs mounted check */}
        {mounted && (
          <Button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`cursor-pointer ${
              theme === 'light'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800'
            }   hidden`}
          >
            {theme === 'light'
              ? <FaRegMoon size={20} />
              : <IoMdSunny size={20} />
            }
          </Button>
        )}

      </div>
    </nav>
  )
}

export default Navbar