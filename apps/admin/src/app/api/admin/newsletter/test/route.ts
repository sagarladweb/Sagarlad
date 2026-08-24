import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendTestEmail } from "@/lib/newsletter";

export const runtime = "nodejs";

const testSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  html: z.string().trim().min(10).max(100_000),
});

// Send the composed email to the admin's own inbox so they can check the real
// render before broadcasting to everyone.
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const to = session.user.email;
  if (!to) return NextResponse.json({ error: "No email on your account" }, { status: 400 });

  try {
    await sendTestEmail(to, parsed.data.subject, parsed.data.html);
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    console.error("[newsletter] test send failed:", err);
    return NextResponse.json(
      { error: "Test send failed" },
      { status: 500 }
    );
  }
}