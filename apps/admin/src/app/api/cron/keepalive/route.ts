import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/revalidate";

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !timingSafeEqual(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Publish any posts whose scheduledAt has passed
    const now = new Date();
    const due = await prisma.post.updateMany({
      where: {
        published: false,
        scheduledAt: { not: null, lte: now },
        deletedAt: null,
      },
      data: {
        published: true,
        publishedAt: now,
        scheduledAt: null,
      },
    });

    if (due.count > 0) {
      await revalidatePublic();
    }

    const post = await prisma.post.findFirst({ select: { id: true, title: true } });
    return NextResponse.json({
      status: "active",
      message: "Supabase database pinged successfully from admin",
      timestamp: now.toISOString(),
      postId: post?.id ?? null,
      published: due.count,
    });
  } catch (err) {
    console.error("[cron] keepalive failed:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
