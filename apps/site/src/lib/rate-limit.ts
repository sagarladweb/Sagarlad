import { prisma } from "@/lib/db";

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

// DB-backed rate limiting. Works across serverless instances (the old in-memory
// map reset per instance and only ever throttled one lambda at a time). One
// upsert per request — acceptable because these endpoints already write to the
// DB anyway. Expired rows are swept opportunistically so the table stays small.
let lastCleanup = 0;

async function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60_000) return;
  lastCleanup = now;
  await prisma.rateLimitEntry
    .deleteMany({ where: { resetAt: { lt: new Date(now - 24 * 60 * 60_000) } } })
    .catch(() => {});
}

export async function rateLimitByIp(
  ip: string,
  limit = 20,
  windowMs = 60_000
): Promise<{ ok: boolean; retryAfter: number }> {
  void cleanup();
  const key = `ip:${ip}`;
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  const record = await prisma.rateLimitEntry.findUnique({ where: { key } });
  if (!record || record.resetAt.getTime() <= now) {
    await prisma.rateLimitEntry.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { ok: true, retryAfter: 0 };
  }

  if (record.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((record.resetAt.getTime() - now) / 1000) };
  }

  await prisma.rateLimitEntry.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { ok: true, retryAfter: 0 };
}
