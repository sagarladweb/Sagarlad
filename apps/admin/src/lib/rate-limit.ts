type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX = 20;
const MAX_ENTRIES = 10_000;

let lastPrune = 0;

function prune() {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit = MAX,
  windowMs = WINDOW_MS
): { ok: boolean; remaining: number; retryAfter: number } {
  prune();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    if (store.size >= MAX_ENTRIES) {
      for (const [k] of store) {
        store.delete(k);
        if (store.size < MAX_ENTRIES) break;
      }
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 };
}

export function rateLimitByIp(
  ip: string,
  limit?: number,
  windowMs?: number
): { ok: boolean; remaining: number; retryAfter: number } {
  return rateLimit(`ip:${ip}`, limit, windowMs);
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

// ---------------------------------------------------------------------------
// Login attempt lockout. DB-backed (via the audit trail) so it works on
// serverless deploys where an in-memory Map is per-instance and useless:
// every failed attempt already writes a LOGIN_FAIL audit row, so we count
// recent failures for the account + source IP across the whole DB.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/db";

const LOGIN_MAX = 3;
const LOGIN_WINDOW_MS = 30 * 60_000;
const FAIL_ACTIONS = ["LOGIN_FAIL", "LOGIN_LOCKED", "LOGIN_THROTTLED"];

export async function loginThrottleStatus(
  email: string,
  ip: string
): Promise<{
  locked: boolean;
  retryAfter: number;
  remaining: number;
}> {
  const since = new Date(Date.now() - LOGIN_WINDOW_MS);
  const emailKey = email.toLowerCase();
  const [accountFails, ipFails] = await Promise.all([
    prisma.auditLogEntry.count({
      where: {
        action: { in: FAIL_ACTIONS },
        createdAt: { gte: since },
        meta: { path: ["email"], equals: emailKey },
      },
    }),
    prisma.auditLogEntry.count({
      where: {
        action: { in: FAIL_ACTIONS },
        createdAt: { gte: since },
        ip: ip === "unknown" ? undefined : ip,
      },
    }),
  ]);
  const total = accountFails + ipFails;
  if (total >= LOGIN_MAX) {
    return {
      locked: true,
      retryAfter: Math.ceil(LOGIN_WINDOW_MS / 1000),
      remaining: 0,
    };
  }
  return { locked: false, retryAfter: 0, remaining: LOGIN_MAX - total };
}
