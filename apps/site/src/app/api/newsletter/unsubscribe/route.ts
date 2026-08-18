import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// One-click unsubscribe from the email footer. Marks the subscriber so future
// campaign snapshots skip them.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (token) {
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
