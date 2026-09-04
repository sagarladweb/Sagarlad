import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";
import { timingSafeCompare } from "@/lib/crypto";
import { processNewsletterQueue } from "@/lib/newsletter";

export const runtime = "nodejs";

// Combined cron endpoint: keep-alive + newsletter drain + scheduled post publishing.
// Vercel free tier allows only 1 cron job, so all tasks share this route.
export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Publish scheduled posts whose time has come
  let published = 0;
  try {
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
    published = due.count;
    if (published > 0) revalidateTag("content", "max");
  } catch (err) {
    console.error("[cron] scheduled post publish failed:", (err as Error).message);
  }

  // 2. Keep Supabase alive
  const post = await dbSafe(
    () => prisma.post.findFirst({ select: { id: true } }),
    null
  );

  // 3. Drain newsletter queue (safe to call when empty — no-ops instantly)
  let newsletter: { sent: number; remaining: number } = { sent: 0, remaining: 0 };
  try {
    newsletter = await processNewsletterQueue();
  } catch (err) {
    console.error("[cron] newsletter drain failed:", (err as Error).message);
  }

  return NextResponse.json({
    status: "ok",
    db: post ? "connected" : "unavailable",
    published,
    newsletter,
    ts: Date.now(),
  });
}
