import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const postSlug = body?.postSlug;
    if (!postSlug || typeof postSlug !== "string") {
      return NextResponse.json({ error: "Missing postSlug" }, { status: 400 });
    }

    // Rate limit: 20 views per IP per minute (generous — avoids counting bot floods)
    const rl = await rateLimitByIp(`view:${getClientIp(request)}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const post = await dbSafe(
      () =>
        prisma.post.findUnique({
          where: { slug: postSlug },
          select: { id: true, views: true },
        }),
      null
    );
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updated = await dbSafe(
      () =>
        prisma.post.update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
          select: { views: true },
        }),
      null
    );

    if (!updated) {
      return NextResponse.json({ views: post.views + 1 });
    }

    return NextResponse.json({ views: updated.views });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
