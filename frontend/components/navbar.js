'use client'

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { FaRegMoon } from "react-icons/fa";
import { SiCanvas } from "react-icons/si";
import { IoMdSunny } from "react-icons/io";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4">

      {/* Logo — Left */}
      <Button
        variant="ghost"
        className="text-xl font-bold flex items-center cursor-pointer   hover:text-2xl transition-colors duration-300"
      >
        <a className="flex flex-row items-center" href="/">
          <SiCanvas size={20} className="mr-2 text-xl hover:text-2xl" />
          CanvasX
        </a>
      </Button>

      {/* Right side: Sign In + Theme Toggle */}
      <div className="flex items-center gap-3 ">
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

        <Button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={`cursor-pointer hidden ${theme === "light" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          {theme === "light" ? <FaRegMoon size={20} /> : <IoMdSunny size={20} />}
        </Button>
      </div>

    </nav>
  );
};

export default Navbar;
