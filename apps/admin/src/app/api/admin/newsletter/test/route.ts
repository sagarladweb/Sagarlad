import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendTestEmail } from "@/lib/newsletter";
import { sanitizeHtml } from "@/lib/sanitize";

export const runtime = "nodejs";

const testSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  html: z.string().trim().min(10).max(100_000),
  to: z.string().trim().email().optional(),
});

// Send the composed email to the admin's own inbox (or a custom test email)
// so they can check the real render before broadcasting to everyone.
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const to = parsed.data.to || session.user.email;
  if (!to) return NextResponse.json({ error: "No email on your account", to: null }, { status: 400 });

  try {
    await sendTestEmail(to, parsed.data.subject, sanitizeHtml(parsed.data.html));
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[newsletter] test send failed:", msg);
    // 401 from Brevo = IP not whitelisted; return a clear message
    const isBrevoAuth = /Brevo 401/i.test(msg);
    return NextResponse.json(
      {
        error: isBrevoAuth
          ? "Brevo rejected the request — the server IP is not whitelisted. Go to Brevo → Settings → Authorized IPs and add the IP, or disable IP restrictions."
          : `Test send failed: ${msg}`,
      },
      { status: isBrevoAuth ? 403 : 502 }
    );
  }
}