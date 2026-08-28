import { prisma } from "@/lib/db";

let inflight: Promise<{ published: number; alive: boolean }> | null = null;
let lastHeartbeat = 0;
let lastFailure = 0;
const HEARTBEAT_INTERVAL = 60_000;
const FAILURE_BACKOFF = 300_000; // 5 min — don't retry immediately if DB is down

/**
 * Self-contained heartbeat that keeps the system alive.
 * Runs on every page load (root layout). Does TWO things in ONE DB query:
 *   1. Publishes posts whose scheduledAt has passed
 *   2. Pings Supabase so the free-tier DB never pauses
 *
 * Promise lock: if two concurrent requests race in, only ONE query fires.
 * The second caller awaits the first caller's result.
 */
export async function heartbeat(): Promise<{
  published: number;
  alive: boolean;
}> {
  const now = Date.now();
  if (now - lastHeartbeat < HEARTBEAT_INTERVAL) {
    return { published: 0, alive: true };
  }
  // If DB was recently unreachable, don't hammer it
  if (now - lastFailure < FAILURE_BACKOFF) {
    return { published: 0, alive: false };
  }

  // If a heartbeat is already running, piggyback on it
  if (inflight) {
    return inflight;
  }

  lastHeartbeat = now;
  inflight = (async () => {
    try {
      const nowDate = new Date();
      const result = await prisma.post.updateMany({
        where: {
          published: false,
          scheduledAt: { not: null, lte: nowDate },
          deletedAt: null,
        },
        data: {
          published: true,
          publishedAt: nowDate,
          scheduledAt: null,
        },
      });

      if (result.count > 0) {
        console.log(`[heartbeat] Published ${result.count} scheduled post(s)`);
      }

      return { published: result.count, alive: true };
    } catch (err) {
      console.warn("[heartbeat] DB ping failed:", (err as Error).message);
      lastFailure = Date.now();
      return { published: 0, alive: false };
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
