import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { enqueueCampaign, processNewsletterQueue } from "@/lib/newsletter";
import { logAudit } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/sanitize";

export const runtime = "nodejs";

const campaignSchema = z.object({
  subject: z.string().trim().min(3, "Subject is too short").max(200),
  html: z.string().trim().min(10, "Email body is too short").max(100_000),
  contentJson: z.unknown().optional(),
});

// Campaigns with per-status delivery counts + the current active subscriber count.
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [campaigns, byCampaign, subscriberCount, subscribers] =
      await Promise.all([
        prisma.newsletterCampaign.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.newsletterDelivery.groupBy({
          by: ["campaignId", "status"],
          _count: { _all: true },
        }),
        prisma.newsletterSubscriber.count({ where: { unsubscribed: false } }),
        prisma.newsletterSubscriber.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            email: true,
            name: true,
            acceptedTerms: true,
            unsubscribed: true,
            createdAt: true,
          },
        }),
      ]);

    const counts = new Map<string, Record<string, number>>();
    for (const row of byCampaign) {
      const m = counts.get(row.campaignId) ?? {};
      m[row.status] = row._count._all;
      counts.set(row.campaignId, m);
    }

    return NextResponse.json({
      subscriberCount,
      subscribers,
      campaigns: campaigns.map((c) => {
        const m = counts.get(c.id) ?? {};
        const queued = m.QUEUED ?? 0;
        const sending = m.SENDING ?? 0;
        const sent = m.SENT ?? 0;
        const failed = m.FAILED ?? 0;
        return {
          id: c.id,
          subject: c.subject,
          createdAt: c.createdAt,
          draft: c.draft,
          contentJson: c.contentJson ?? null,
          total: queued + sending + sent + failed,
          queued,
          sent,
          failed,
        };
      }),
    });
  } catch (err) {
    console.error("[newsletter] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    // Sanitize HTML before sending — strip any scripts/iframes/event handlers
    const cleanHtml = sanitizeHtml(parsed.data.html);

    const { campaign, queued } = await enqueueCampaign(
      parsed.data.subject,
      cleanHtml
    );
    // Store the structured composer state so the campaign can be duplicated later.
    if (parsed.data.contentJson !== undefined) {
      await prisma.newsletterCampaign.update({
        where: { id: campaign.id },
        data: { contentJson: parsed.data.contentJson as object },
      });
    }
    await logAudit("NEWSLETTER", {
      userId: session.user.id,
      meta: { subject: parsed.data.subject, queued },
    });
    // Fire-and-forget: drain in background so the response returns in <5s.
    processNewsletterQueue().catch((err) =>
      console.error("[newsletter] background drain failed:", err)
    );

    return NextResponse.json(
      { campaign, queued, sentNow: 0, remainingToday: "?" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[newsletter] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

// Delete a campaign (draft or sent).
export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Delete deliveries first (foreign key), then the campaign
    await prisma.newsletterDelivery.deleteMany({ where: { campaignId: id } });
    await prisma.newsletterCampaign.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
