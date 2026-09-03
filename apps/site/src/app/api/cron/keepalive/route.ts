import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { timingSafeCompare } from "@/lib/crypto";
import { processNewsletterQueue } from "@/lib/newsletter";

export const runtime = "nodejs";

// Combined cron endpoint: Supabase keep-alive + newsletter queue drain.
// Vercel free tier allows only 1 cron job, so both tasks share this route.
// A single daily invocation keeps the DB awake AND drains any queued emails.
export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Keep Supabase alive
  const post = await dbSafe(
    () => prisma.post.findFirst({ select: { id: true } }),
    null
  );

  // 2. Drain newsletter queue (safe to call when empty — no-ops instantly)
  let newsletter: { sent: number; remaining: number } = { sent: 0, remaining: 0 };
  try {
    newsletter = await processNewsletterQueue();
  } catch (err) {
    console.error("[cron] newsletter drain failed:", (err as Error).message);
  }

  return NextResponse.json({
    status: "ok",
    db: post ? "connected" : "unavailable",
    newsletter,
    ts: Date.now(),
  });
}
