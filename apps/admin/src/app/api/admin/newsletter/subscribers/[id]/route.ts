import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const counts = await prisma.newsletterDelivery.groupBy({
    by: ["campaignId", "status"],
    _count: { _all: true },
  });
  return NextResponse.json({ counts });
}

async function deleteSubscriber(id: string, request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.newsletterSubscriber.delete({ where: { id } });
  await logAudit("SUBSCRIBER_DELETE", {
    userId: session.user.id,
    meta: { email: sub.email },
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  return deleteSubscriber(id, request);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteSubscriber(id, request);
}
