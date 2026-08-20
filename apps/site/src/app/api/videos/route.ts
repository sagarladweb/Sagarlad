import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";
import { sanitizeHtml } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

// Cursor-paginated public feed. The page renders the first page as a Server
// Component; the client "Load more" button fetches subsequent pages here.
// Ordering mirrors the cached list (sortOrder, then createdAt).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const platform = url.searchParams.get("platform"); // "youtube" | "instagram"
  const limitRaw = Number(url.searchParams.get("limit") ?? PAGE_SIZE);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 48)
    : PAGE_SIZE;

  // Platform is derived from the embed URL, so filter in JS — the set is small.
  const all = await prisma.video.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      embedUrl: true,
      thumbnail: true,
      content: true,
      category: { select: { slug: true } },
    },
  });

  const normalized = all.map((v) => ({
    ...v,
    content: v.content ? sanitizeHtml(v.content) : null,
  }));

  const filtered =
    platform === "youtube" || platform === "instagram"
      ? normalized.filter((v) => (platform === "instagram" ? isInstagramUrl(v.embedUrl) : !isInstagramUrl(v.embedUrl)))
      : normalized;

  const start = cursor ? filtered.findIndex((v) => v.id === cursor) + 1 : 0;
  const page = filtered.slice(start, start + limit);
  const nextCursor = start + limit < filtered.length ? page[page.length - 1].id : null;

  return NextResponse.json({ videos: page, nextCursor });
}
