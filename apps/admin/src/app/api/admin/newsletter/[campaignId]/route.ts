import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

// Per-campaign delivery list so the admin can see exactly who was sent the
// newsletter, who is still queued, and why any failed.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaignId } = await params;
  const deliveries = await prisma.newsletterDelivery.findMany({
    where: { campaignId },
    orderBy: { createdAt: "asc" },
    take: 500,
    include: {
      subscriber: { select: { email: true, name: true, unsubscribed: true } },
    },
  });

  return NextResponse.json({
    deliveries: deliveries.map((d) => ({
      id: d.id,
      email: d.subscriber.email,
      name: d.subscriber.name,
      unsubscribed: d.subscriber.unsubscribed,
      status: d.status,
      sentAt: d.sentAt,
      error: d.error,
    })),
  });
}