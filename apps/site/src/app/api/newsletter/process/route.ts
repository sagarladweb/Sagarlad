import { NextResponse } from "next/server";
import { timingSafeCompare } from "@/lib/crypto";
import { processNewsletterQueue } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Triggered by Vercel Cron, an external scheduler (e.g. GitHub Actions), or a
// crontab on a self-hosted server. Requires CRON_SECRET so randoms can't drain
// the daily email quota. Both GET (Vercel Cron default) and POST are accepted.
async function drain(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!secret || !timingSafeCompare(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processNewsletterQueue();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process queue" },
      { status: 500 }
    );
  }
}

export const GET = drain;
export const POST = drain;
