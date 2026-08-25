"use client";

import { useState, useEffect } from "react";
import { Rss, X } from "lucide-react";

export function RssBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("rss-banner-dismissed")) {
        setDismissed(true);
        return;
      }
    } catch {}
    const t = setTimeout(() => setShow(true), 16000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setShow(false);
    setDismissed(true);
    try { sessionStorage.setItem("rss-banner-dismissed", "1"); } catch {}
  }

  if (dismissed || !show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto animate-in slide-in-from-bottom-3 fade-in duration-500">
        <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg px-4 py-2.5">
          {/* RSS icon — always blue */}
          <Rss className="w-4 h-4 text-[#3f88c5] shrink-0" />

          {/* Text */}
          <span className="text-xs sm:text-sm text-muted-foreground truncate">
            Subscribe via RSS
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Feedly — blue icon + short label */}
          <a
            href="https://feedly.com/i/subscription/feed/https://sagarlad.com/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3f88c5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d6a9e] transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
              <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2" />
              <path
                d="M6 17.5V9.5C6 7.567 7.567 6 9.5 6H10V8.5H9.5C8.672 8.5 8 9.172 8 10V11H10.5V17.5H6ZM12 17.5V13.5H14.5V17.5H12ZM16 17.5V10.5H18.5V17.5H16Z"
                fill="white"
              />
            </svg>
            Follow
          </a>

          {/* Other readers — clean icon-only button */}
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60 text-muted-foreground hover:bg-muted transition-colors shrink-0"
            title="Open RSS feed"
          >
            <Rss className="w-4 h-4" />
          </a>

          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-muted-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
