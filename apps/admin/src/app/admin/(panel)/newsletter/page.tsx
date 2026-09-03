import { prisma } from "@/lib/db";
import { assertPhase2 } from "@/lib/phase";
import { Mail, FileText, Users, Send, PenLine } from "lucide-react";
import Link from "next/link";
import { CampaignList } from "@/components/admin/CampaignList";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = parseInt(process.env.NEWSLETTER_DAILY_LIMIT || "300", 10);

function statCard(icon: React.ReactNode, label: string, value: number | string, accent?: boolean) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default async function NewsletterPage() {
  assertPhase2();

  let subscriberCount = 0;
  let campaignCount = 0;
  let sentCount = 0;
  let sentToday = 0;
  let inFlight = 0;
  let recentCampaigns: { id: string; subject: string; createdAt: string; draft: boolean; sent: number; total: number }[] = [];

  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    [subscriberCount, campaignCount, sentCount, sentToday, inFlight] = await Promise.all([
      prisma.newsletterSubscriber.count({ where: { unsubscribed: false } }),
      prisma.newsletterCampaign.count(),
      prisma.newsletterDelivery.count({ where: { status: "SENT" } }),
      prisma.newsletterDelivery.count({ where: { status: "SENT", sentAt: { gte: dayStart } } }),
      prisma.newsletterDelivery.count({ where: { status: "SENDING" } }),
    ]);
    const recentRows = await prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        subject: true,
        createdAt: true,
        draft: true,
        deliveries: { select: { status: true } },
      },
    });
    recentCampaigns = recentRows.map((r) => ({
      id: r.id,
      subject: r.subject,
      createdAt: r.createdAt.toISOString(),
      draft: r.draft,
      sent: r.deliveries.filter((d) => d.status === "SENT").length,
      total: r.deliveries.length,
    }));
  } catch (err) {
    console.warn("[admin newsletter] DB query failed:", (err as Error).message);
  }

  const remaining = Math.max(0, DAILY_LIMIT - sentToday - inFlight);
  const pct = Math.round((sentToday + inFlight) / DAILY_LIMIT * 100);
  const quotaColor = remaining > 200 ? "text-green-600 dark:text-green-400"
    : remaining > 50 ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage subscribers and send broadcasts.
          </p>
        </div>
        <Link
          href="/admin/newsletter/compose"
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PenLine className="w-4 h-4" />
          Compose
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statCard(<Users className="w-4 h-4" />, "Subscribers", subscriberCount)}
        {statCard(<FileText className="w-4 h-4" />, "Campaigns", campaignCount)}
        {statCard(<Send className="w-4 h-4" />, "Emails sent", sentCount, true)}
      </div>

      {/* Daily quota */}
      <p className={`text-xs tabular-nums ${quotaColor}`}>
        {remaining === 0
          ? `Daily limit reached — ${sentToday + inFlight} of ${DAILY_LIMIT} sent today`
          : `${remaining} of ${DAILY_LIMIT} emails remaining today`
        }
        {inFlight > 0 && remaining > 0 ? ` · ${inFlight} sending now` : ""}
      </p>

      {/* Recent campaigns */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Recent campaigns
        </h2>
        {recentCampaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <Mail className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No campaigns yet. Send your first newsletter!
            </p>
            <Link
              href="/admin/newsletter/compose"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <PenLine className="w-3.5 h-3.5" />
              Compose now
            </Link>
          </div>
        ) : (
          <CampaignList campaigns={recentCampaigns} />
        )}
      </div>
    </div>
  );
}
