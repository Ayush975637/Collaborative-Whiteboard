import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import OpenInBrowser from "../components/OpenInBrowser";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CanvasX",
  description: "A real-time collaborative whiteboard application built with Next.js and Socket.IO.",
};

export default function RootLayout({ children }) {

 
  return (
    
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <OpenInBrowser />
       
      {children}
      </ThemeProvider>
     
  
      </body>
    </html>
    </ClerkProvider>
  
  );
}
