import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { newsletterSchema } from "@/lib/validations";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
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

    const existing = await dbSafe(
      () => prisma.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } }),
      null
    );

    if (existing) {
      if (existing.unsubscribed) {
        const updated = await dbSafe(
          () =>
            prisma.newsletterSubscriber.update({
              where: { id: existing.id },
              data: {
                unsubscribed: false,
                name: parsed.data.name || existing.name,
                acceptedTerms: parsed.data.acceptedTerms ?? existing.acceptedTerms,
              },
            }),
          null
        );
        if (!updated) {
          return NextResponse.json({ error: "Failed to resubscribe" }, { status: 503 });
        }
        return NextResponse.json({ ok: true }, { status: 201 });
      }
      return NextResponse.json(
        { error: "This email is already subscribed." },
        { status: 409 }
      );
    }

    const created = await dbSafe(
      () =>
        prisma.newsletterSubscriber.create({
          data: {
            email: parsed.data.email,
            name: parsed.data.name || null,
            acceptedTerms: parsed.data.acceptedTerms ?? false,
          },
        }),
      null
    );

    if (!created) {
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 503 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
