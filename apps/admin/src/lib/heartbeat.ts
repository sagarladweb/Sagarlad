import { prisma } from "@/lib/db";

// Admin-side heartbeat: pings Supabase so the free-tier DB never pauses.
// Auto-publish is handled by the site heartbeat — admin only keeps the DB alive.

let lastRun = 0;
const INTERVAL = 60_000;

export async function adminHeartbeat(): Promise<boolean> {
  const now = Date.now();
  if (now - lastRun < INTERVAL) return true;
  lastRun = now;
  try {
    await prisma.post.findFirst({ select: { id: true } });
    return true;
  } catch {
    return false;
  }
}
