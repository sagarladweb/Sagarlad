"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BlogVideoGrid } from "@/components/blog/BlogVideoGrid";

type Video = {
  id: string;
  title: string;
  slug: string | null;
  embedUrl: string;
  thumbnail: string | null;
  content?: string | null;
};

// Server Component renders the first page of videos; this client component
// appends more via cursor pagination on demand — no iframe nodes are mounted
// until a card is clicked (see BlogVideoGrid).
export function VideoFeed({
  initial,
  platform,
  masonry = false,
}: {
  initial: Video[];
  platform?: "youtube" | "instagram";
  masonry?: boolean;
}) {
  const [videos, setVideos] = useState<Video[]>(initial);
  const [cursor, setCursor] = useState<string | null>(
    initial.length > 0 ? initial[initial.length - 1].id : null
  );
  const [hasMore, setHasMore] = useState(initial.length > 0);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (cursor) q.set("cursor", cursor);
      if (platform) q.set("platform", platform);
      const res = await fetch(`/api/videos?${q.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setVideos((v) => [...v, ...data.videos]);
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BlogVideoGrid videos={videos} masonry={masonry} />
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-brand-light/60 hover:text-brand disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Loading…" : "Load more videos"}
          </button>
        </div>
      )}
    </>
  );
}
