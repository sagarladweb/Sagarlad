import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const platform = url.searchParams.get("platform");
    const limitRaw = Number(url.searchParams.get("limit") ?? PAGE_SIZE);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.trunc(limitRaw), 1), 48)
      : PAGE_SIZE;

    // Platform filter pushed to DB instead of fetching all rows
    const platformFilter =
      platform === "instagram"
        ? { embedUrl: { contains: "instagram.com" } }
        : platform === "youtube"
          ? { embedUrl: { not: { contains: "instagram.com" } } }
          : {};

    const all = await dbSafe(
      () =>
        prisma.video.findMany({
          where: { published: true, deletedAt: null, ...platformFilter },
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
        }),
      []
    );

    const start = cursor ? all.findIndex((v) => v.id === cursor) + 1 : 0;
    const page = all.slice(start, start + limit);
    const nextCursor = start + limit < all.length ? page[page.length - 1].id : null;

    return NextResponse.json({ videos: page, nextCursor });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
