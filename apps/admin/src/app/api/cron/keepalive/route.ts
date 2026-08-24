import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";

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
    const post = await prisma.post.findFirst({ select: { id: true, title: true } });
    return NextResponse.json({
      status: "active",
      message: "Supabase database pinged successfully from admin",
      timestamp: new Date().toISOString(),
      postId: post?.id ?? null,
    });
  } catch (err) {
    console.error("[cron] keepalive failed:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
