import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

    let post;
    try {
      post = await prisma.post.findUnique({
        where: { slug: postSlug },
        select: { id: true, views: true },
      });
    } catch {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let updated;
    try {
      updated = await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
        select: { views: true },
      });
    } catch {
      return NextResponse.json({ views: post.views + 1 });
    }

    return NextResponse.json({ views: updated.views });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
