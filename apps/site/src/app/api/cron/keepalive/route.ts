import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

// Lightweight keep-alive ping. Supabase free-tier pauses the DB after ~7 days
// of inactivity; a GitHub Action hits this every 2 days with CRON_SECRET to
// prevent that. Returns 200 even when the DB is cold-starting so the caller
// never treats a slow wake-up as a failure.
export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
