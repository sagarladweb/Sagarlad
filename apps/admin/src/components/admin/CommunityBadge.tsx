"use client";

import { useEffect, useState, useCallback } from "react";

const BADGE_KEY = "admin-moderation-last-viewed";
const COUNT_KEY = "admin-moderation-badge-count";

export function CommunityBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      let since = "1970-01-01T00:00:00.000Z";
      try {
        const saved = localStorage.getItem(BADGE_KEY);
        if (saved) since = saved;
      } catch {}
      const res = await fetch(`/api/admin/moderation/counts?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      const data = await res.json();
      const total = data.total ?? 0;
      setCount(total);
      try { localStorage.setItem(COUNT_KEY, String(total)); } catch {}
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Clear badge when on moderation page
  useEffect(() => {
    const onModPage =
      window.location.pathname === "/admin/moderation" ||
      window.location.pathname.startsWith("/admin/moderation/");
    if (onModPage) {
      try {
        localStorage.setItem(BADGE_KEY, new Date().toISOString());
      } catch {}
      setCount(0);
      try { localStorage.setItem(COUNT_KEY, "0"); } catch {}
    }
  }, []);

  if (count === 0) return null;

  return (
    <span className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
