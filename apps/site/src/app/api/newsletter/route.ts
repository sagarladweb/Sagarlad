import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { newsletterSchema } from "@/lib/validations";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rl = await rateLimitByIp(getClientIp(request), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    if (existing.unsubscribed) {
      // Re-subscribing after an unsubscribe just flips the flag back.
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          unsubscribed: false,
          name: parsed.data.name || existing.name,
          acceptedTerms: parsed.data.acceptedTerms ?? existing.acceptedTerms,
        },
      });
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    return NextResponse.json(
      { error: "This email is already subscribed." },
      { status: 409 }
    );
  }

  await prisma.newsletterSubscriber.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name || null,
      acceptedTerms: parsed.data.acceptedTerms ?? false,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
