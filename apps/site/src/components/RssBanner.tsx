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
      <div className="mx-auto max-w-fit pointer-events-auto animate-in slide-in-from-bottom-3 fade-in duration-500">
        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/80 backdrop-blur-xl shadow-lg px-2 py-2 sm:px-3">
          {/* RSS icon */}
          <Rss className="w-4 h-4 text-brand-light shrink-0" />

          {/* Label — hidden on very small screens */}
          <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap pr-1">
            RSS Feed
          </span>

          {/* Primary CTA — yellow pill, Feedly */}
          <a
            href="https://feedly.com/i/subscription/feed/https://sagarlad.com/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
              <path
                d="M6 17.5V9.5C6 7.567 7.567 6 9.5 6H10V8.5H9.5C8.672 8.5 8 9.172 8 10V11H10.5V17.5H6ZM12 17.5V13.5H14.5V17.5H12ZM16 17.5V10.5H18.5V17.5H16Z"
                fill="currentColor"
              />
            </svg>
            Follow on Feedly
          </a>

          {/* Secondary — RSS icon link for other readers */}
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            title="Open RSS feed"
          >
            <Rss className="w-4 h-4" />
          </a>

          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
