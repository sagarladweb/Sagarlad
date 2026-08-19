import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!subscriber) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.newsletterSubscriber.delete({ where: { id } });
  await logAudit("SUBSCRIBER_DELETE", {
    userId: session.user.id,
    meta: { email: subscriber.email },
  });
  return NextResponse.json({ ok: true });
}