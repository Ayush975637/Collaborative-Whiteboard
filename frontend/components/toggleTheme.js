"use client";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { IoIosSunny } from "react-icons/io";
import { FaRegMoon } from "react-icons/fa";
export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
    {theme === "dark"?<IoIosSunny/>:<FaRegMoon/> }
    </Button>
  );
}