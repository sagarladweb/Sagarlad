"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const BADGE_KEY = "admin-moderation-last-viewed";

export function CommunityBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);
  const initialized = useRef(false);

  const fetchCount = useCallback(async () => {
    try {
      let since: string;
      try {
        const saved = localStorage.getItem(BADGE_KEY);
        if (saved) {
          since = saved;
        } else {
          // First visit: stamp now so we only show future items
          since = new Date().toISOString();
          localStorage.setItem(BADGE_KEY, since);
          initialized.current = true;
          setCount(0);
          return;
        }
      } catch {
        return;
      }
      const res = await fetch(`/api/admin/moderation/counts?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.total ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch with setState in callback
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Clear badge when on moderation page — stamp "last viewed" to now
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin/moderation" || path.startsWith("/admin/moderation/")) {
      try {
        localStorage.setItem(BADGE_KEY, new Date().toISOString());
      } catch {}
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear badge on moderation page
      setCount(0);
    }
  }, []);

  if (count === 0) return null;

  return (
    <span className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
