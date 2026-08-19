import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { commentSchema } from "@/lib/validations";
import { sanitizeHtml } from "@/lib/sanitize";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const postSlug = url.searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json({ error: "Missing postSlug" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { slug: postSlug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
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

  const post = await prisma.post.findUnique({
    where: { slug: parsed.data.postSlug },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const clientIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || null;

  const comment = await prisma.comment.create({
    data: {
      name: sanitizeHtml(parsed.data.name),
      email: parsed.data.email ? sanitizeHtml(parsed.data.email) : null,
      content: sanitizeHtml(parsed.data.content),
      ip: clientIp || null,
      userAgent: userAgent || null,
      postId: post.id,
      clientToken: parsed.data.clientToken || null,
      approved: true,
    },
  });

  return NextResponse.json({ ok: true, id: comment.id }, { status: 201 });
}
