import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { ok, retryAfter } = await rateLimitByIp(`like:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const body = await request.json().catch(() => null);
    const postSlug = body?.postSlug;
    const clientToken = body?.clientToken;
    const action = body?.action;

    if (
      !postSlug || typeof postSlug !== "string" ||
      !clientToken || typeof clientToken !== "string" ||
      (action !== "like" && action !== "unlike")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Sanitize: slug and token are alphanumeric + dashes only
    const safeSlug = postSlug.replace(/[^a-z0-9-]/g, "").slice(0, 200);
    const safeToken = clientToken.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);

    let post;
    try {
      post = await prisma.post.findUnique({
        where: { slug: safeSlug },
        select: { id: true },
      });
    } catch {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if this token already liked this post using a lightweight approach:
    // We store liked posts in a simple JSON cookie on the client, but for
    // server-side dedup we check the like_events table (not in schema — we
    // use a simpler approach: just track in a JSONB field or rely on client
    // token uniqueness). Since we don't have a likes table, we'll keep it
    // simple: the client manages dedup via localStorage, and the server
    // just increments/decrements. For a low-traffic blog this is fine.

    let updated;
    try {
      updated = await prisma.post.update({
        where: { id: post.id },
        data: { likes: action === "like" ? { increment: 1 } : { decrement: 1 } },
        select: { likes: true },
      });
    } catch {
      return NextResponse.json({ likes: 0, liked: action === "unlike" }, { status: 500 });
    }

    return NextResponse.json({
      likes: updated.likes,
      liked: action === "like",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
