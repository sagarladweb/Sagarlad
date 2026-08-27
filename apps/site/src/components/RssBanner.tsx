"use client";

import { useState, useEffect } from "react";
import { Rss, X } from "lucide-react";

export function RssBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 16000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Mobile: compact bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-[70] sm:hidden">
        <div className="bg-white border-t border-border/60">
          <div className="flex items-center justify-between w-full px-3 py-2">
            <div className="flex items-center gap-2">
              <Rss className="h-3.5 w-3.5 text-brand" />
              <span className="text-xs font-medium text-foreground">Subscribe via RSS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href="https://feedly.com/i/subscription/feed/http%3A%2F%2Fsagarlad.com%2Frss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium inline-flex items-center rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-accent-foreground hover:opacity-90"
              >
                Open Feed
              </a>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: toast popup bottom-right */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-[70]">
        <div className="bg-white rounded-lg border border-border/60 shadow-lg shadow-black/5 p-4 w-[300px]">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 shrink-0">
              <Rss className="h-4 w-4 text-accent-strong" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Subscribe via RSS</p>
              <p className="text-xs text-muted-foreground mt-0.5">Get updates in your feed reader</p>
            </div>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="inline-flex items-center justify-center h-6 w-6 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <a
            href="https://feedly.com/i/subscription/feed/http%3A%2F%2Fsagarlad.com%2Frss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium mt-3 flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 w-full"
          >
            Open Feed
          </a>
        </div>
      </div>
    </>
  );
}
