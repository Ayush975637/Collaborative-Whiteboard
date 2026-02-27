'use client'
import { useEffect, useState } from 'react'

const ShareRoom=({roomId})=>{
const [copied,setCopied]=useState(false)
const [roomLink,setRoomLink]=useState(typeof window !== 'undefined' ? window.location.href : '')

// room link

const message=`Join my collaborative whiteboard room: ${roomLink}`


// All platform shareable url
const shareLinks={
    
    gmail: `mailto:?subject=Join%20my%20collaborative%20whiteboard%20room&body=${encodeURIComponent(message)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(roomLink)}&text=${encodeURIComponent("Join my room!")}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
}


const copyLink =async()=>{
    await navigator.clipboard.writeText(roomLink)
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
};
const handleNativeShare=async()=>{
    if(navigator.share){
        await navigator.share({
            title:'Collaborative Whiteboard Room',
            text:message,
            url:roomLink
        })
    }
    else{
        copyLink()
    }

        }









return (
 <div className="p-4 bg-white rounded-xl shadow-md w-80">
      <h2 className="text-lg font-bold mb-3">Share Room</h2>

      {/* Room Link Display */}
      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg mb-4">
        <p className="text-sm text-gray-600 truncate flex-1">{roomLink}</p>
        <button
          onClick={copyLink}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg"
        >
          {copied ? "Copied! ✅" : "Copy"}
        </button>
      </div>
{/* ✅ Native Share Button — best for mobile */}
      <button
        onClick={handleNativeShare}
        className="w-full bg-purple-500 text-white py-2 rounded-lg text-sm mb-3"
      >
        Share 📤
      </button>
      {/* Share Buttons */}
      <div className="flex gap-3">
        <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer"
           className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
          WhatsApp
        </a>
        {/* <a href={shareLinks.gmail} target="_blank" rel="noreferrer"
           className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
          Gmail
        </a> */}
        <a href={shareLinks.telegram} target="_blank" rel="noreferrer"
           className="bg-blue-400 text-white px-4 py-2 rounded-lg text-sm">
          Telegram
        </a>
      </div>
    </div>




)



}

export default ShareRoom;