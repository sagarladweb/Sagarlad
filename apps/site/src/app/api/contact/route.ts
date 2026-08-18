import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validations";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rl = await rateLimitByIp(getClientIp(request), 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await prisma.contactRequest.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      organization: parsed.data.organization,
      eventDate: parsed.data.eventDate || null,
      message: parsed.data.message || null,
      type: parsed.data.type,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
