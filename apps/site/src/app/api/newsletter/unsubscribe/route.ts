import { prisma } from "@/lib/db";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { ok, retryAfter } = await rateLimitByIp(`unsub:${ip}`, 10, 60_000);
  if (!ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const token = new URL(request.url).searchParams.get("token");
  if (token && typeof token === "string") {
    await prisma.newsletterSubscriber.updateMany({
      where: { unsubscribeToken: token, unsubscribed: false },
      data: { unsubscribed: true },
    });
  }

  return new Response(
    `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#fafafa;display:grid;place-items:center;min-height:100vh;margin:0">
      <div style="text-align:center;padding:32px">
        <h1 style="font-size:22px">You're unsubscribed.</h1>
        <p style="color:#666">You won't receive The Sagar Lad Letter anymore.</p>
      </div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
