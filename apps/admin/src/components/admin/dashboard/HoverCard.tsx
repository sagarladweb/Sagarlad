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
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const start = () => {
    timer.current = setTimeout(() => setVisible(true), delay);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={start} onMouseLeave={cancel}>
      {children}
      {visible && (
        <div className="absolute inset-0 z-20 rounded-2xl border border-accent/30 bg-card/95 backdrop-blur-sm p-5 shadow-lg animate-in fade-in duration-200 overflow-auto">
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
