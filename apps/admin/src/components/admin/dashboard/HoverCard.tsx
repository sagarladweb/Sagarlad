"use client";

import { useEffect, useRef, useState } from "react";

export function HoverCard({
  children,
  details,
  delay = 3000,
}: {
  children: React.ReactNode;
  details: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [hint, setHint] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const start = () => {
    hintTimer.current = setTimeout(() => setHint(true), 1000);
    timer.current = setTimeout(() => {
      setVisible(true);
      setHint(false);
    }, delay);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setVisible(false);
    setHint(false);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={start} onMouseLeave={cancel}>
      {children}
      {hint && !visible && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[1px] transition-opacity duration-300">
          <span className="text-[10px] font-medium text-muted-foreground">Hold to view details</span>
        </div>
      )}
      {visible && (
        <div className="absolute inset-0 z-20 rounded-2xl border border-accent/30 bg-card/95 backdrop-blur-sm p-5 shadow-lg transition-opacity duration-300 opacity-100 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Details</span>
            <button
              type="button"
              onClick={cancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
          {details}
        </div>
      )}
    </div>
  );
}
