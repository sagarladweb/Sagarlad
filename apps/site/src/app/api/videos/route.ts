import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";

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

    const all = await dbSafe(
      () =>
        prisma.video.findMany({
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
        }),
      []
    );

    const filtered =
      platform === "youtube" || platform === "instagram"
        ? all.filter((v) => (platform === "instagram" ? isInstagramUrl(v.embedUrl) : !isInstagramUrl(v.embedUrl)))
        : all;

    const start = cursor ? filtered.findIndex((v) => v.id === cursor) + 1 : 0;
    const page = filtered.slice(start, start + limit);
    const nextCursor = start + limit < filtered.length ? page[page.length - 1].id : null;

    return NextResponse.json({ videos: page, nextCursor });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
