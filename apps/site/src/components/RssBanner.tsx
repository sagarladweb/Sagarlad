"use client";

import { useState, useEffect } from "react";
import { Rss, X } from "lucide-react";

function FeedlyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#2BB24C" />
      <path
        d="M6 17.5V9.5C6 7.567 7.567 6 9.5 6H10V8.5H9.5C8.672 8.5 8 9.172 8 10V11H10.5V17.5H6ZM12 17.5V13.5H14.5V17.5H12ZM16 17.5V10.5H18.5V17.5H16Z"
        fill="white"
      />
    </svg>
  );
}

export function RssBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this session
    try {
      if (sessionStorage.getItem("rss-banner-dismissed")) {
        setDismissed(true);
        return;
      }
    } catch { /* */ }

    const timer = setTimeout(() => setShow(true), 16000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setShow(false);
    setDismissed(true);
    try { sessionStorage.setItem("rss-banner-dismissed", "1"); } catch { /* */ }
  }

  if (dismissed || !show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="rounded-2xl border border-border bg-card shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 p-2 rounded-xl bg-accent/10">
            <Rss className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Never miss a post</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subscribe with your favorite reader — takes 2 seconds, no email required.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <a
                href="https://feedly.com/i/subscription/feed/https://sagarlad.com/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <FeedlyIcon className="w-4 h-4 rounded" />
                Subscribe on Feedly
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Other readers
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 p-1 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
