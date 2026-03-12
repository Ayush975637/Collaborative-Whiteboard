"use client";
import { useEffect, useState } from "react";

export default function OpenInBrowser() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;

    // ✅ Detects LinkedIn, Instagram, Facebook in-app browsers
    const isInApp =
      ua.includes("LinkedIn") ||
      ua.includes("FBAN") ||      // Facebook
      ua.includes("FBAV") ||      // Facebook
      ua.includes("Instagram") ||
      ua.includes("BytedanceWebview"); // TikTok

    setIsInAppBrowser(isInApp);
  }, []);

  if (!isInAppBrowser) return null; // normal browser — show nothing

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-8 text-center gap-6">
      
      <h2 className="text-2xl font-bold text-black">
        Open in your browser
      </h2>

      <p className="text-gray-500 text-sm">
        This app cannot sign you in from LinkedIn's built-in browser.
        Please open it in Chrome or Safari to continue.
      </p>

      {/* ✅ This button copies the URL so user can paste in real browser */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied! Paste it in Chrome or Safari.");
        }}
        className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition"
      >
        Copy Link
      </button>

      {/* ✅ On Android this sometimes directly opens Chrome */}
      <a
        href={`intent://${window.location.href.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`}
        className="text-blue-500 text-sm underline"
      >
        Try opening in Chrome (Android)
      </a>

    </div>
  );
}