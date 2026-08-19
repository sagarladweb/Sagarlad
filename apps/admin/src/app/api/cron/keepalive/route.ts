import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const post = await prisma.post.findFirst({ select: { id: true, title: true } });
    return NextResponse.json({
      status: "active",
      message: "Supabase database pinged successfully from admin",
      timestamp: new Date().toISOString(),
      postId: post?.id ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}
