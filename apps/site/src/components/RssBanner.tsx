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
    <div className="fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
          {/* Left — icon + text */}
          <div className="flex items-center gap-2.5">
            <Rss className="h-5 w-5 text-accent shrink-0" />
            <span className="text-sm sm:text-base font-semibold text-white">
              Subscribe via RSS
            </span>
          </div>

          {/* Right — CTA + dismiss */}
          <div className="flex items-center gap-2">
            <a
              href="https://feedly.com/i/subscription/feed/https://sagarlad.com/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
                <path
                  d="M6 17.5V9.5C6 7.567 7.567 6 9.5 6H10V8.5H9.5C8.672 8.5 8 9.172 8 10V11H10.5V17.5H6ZM12 17.5V13.5H14.5V17.5H12ZM16 17.5V10.5H18.5V17.5H16Z"
                  fill="currentColor"
                />
              </svg>
              Follow on Feedly
            </a>

            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="Open RSS feed"
            >
              <Rss className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
