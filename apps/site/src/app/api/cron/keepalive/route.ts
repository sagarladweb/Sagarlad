import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

// Lightweight keep-alive ping. Supabase free-tier pauses the DB after ~7 days
// of inactivity; this endpoint is hit by a GitHub Action every 2 days to
// prevent that. Returns 200 even when the DB is down so the caller never
// treats a cold-start delay as a failure.
export async function GET() {
  const post = await dbSafe(
    () => prisma.post.findFirst({ select: { id: true } }),
    null
  );
  return NextResponse.json({
    status: "ok",
    db: post ? "connected" : "unavailable",
    ts: Date.now(),
  });
}
