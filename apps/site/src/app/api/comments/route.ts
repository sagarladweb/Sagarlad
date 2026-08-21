import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { commentSchema } from "@/lib/validations";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Strip HTML tags and trim — lightweight, no jsdom dependency. */
function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const postSlug = url.searchParams.get("postSlug");

    if (!postSlug) {
      return NextResponse.json({ error: "Missing postSlug" }, { status: 400 });
    }

    const post = await dbSafe(
      () => prisma.post.findUnique({ where: { slug: postSlug }, select: { id: true } }),
      null
    );
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await dbSafe(
      () =>
        prisma.comment.findMany({
          where: { postId: post.id, approved: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, content: true, createdAt: true },
        }),
      []
    );

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rl = await rateLimitByIp(getClientIp(request), 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const post = await dbSafe(
      () => prisma.post.findUnique({ where: { slug: parsed.data.postSlug }, select: { id: true } }),
      null
    );
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || null;

    const comment = await dbSafe(
      () =>
        prisma.comment.create({
          data: {
            name: stripTags(parsed.data.name),
            email: parsed.data.email ? stripTags(parsed.data.email) : null,
            content: stripTags(parsed.data.content),
            ip: clientIp || null,
            userAgent: userAgent || null,
            postId: post.id,
            clientToken: parsed.data.clientToken || null,
            approved: false,
          },
        }),
      null
    );

    if (!comment) {
      return NextResponse.json({ error: "Failed to submit comment" }, { status: 503 });
    }

    return NextResponse.json({ ok: true, id: comment.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
