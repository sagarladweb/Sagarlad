import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { youtubeId, youtubeWatchUrl } from "@/lib/youtube";
import { normalizeVideoUrl } from "@/lib/video";
import { downloadToSupabase } from "@/lib/storage";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const embedUrl = url.searchParams.get("url");
  if (!embedUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const norm = normalizeVideoUrl(embedUrl);
  if (!norm) {
    return NextResponse.json(
      { error: "That doesn't look like a YouTube or Instagram link." },
      { status: 400 }
    );
  }

  if (norm.platform === "instagram") {
    return NextResponse.json({
      title: null,
      thumbnailUrl: null,
      platform: "instagram",
    });
  }

  const id = youtubeId(norm.url);
  if (!id) {
    return NextResponse.json(
      { error: "That doesn't look like a YouTube or Instagram link." },
      { status: 400 }
    );
  }

  let title: string | null = null;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeWatchUrl(norm.url) ?? "")}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      title = typeof data?.title === "string" ? data.title : null;
    }
  } catch {
    // title stays null, admin can fill it in
  }

  const thumbnail = await downloadToSupabase({
    remoteUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    folder: "videos",
  });

  return NextResponse.json({ title, thumbnailUrl: thumbnail });
}
