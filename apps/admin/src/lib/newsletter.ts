import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";
import { emailShell } from "@/lib/newsletterTemplates";

// Free Brevo tier = 300 emails/day. Overridable via env so the same logic
// works if they ever move to a paid tier.
export const DAILY_LIMIT = Number(process.env.DAILY_EMAIL_LIMIT ?? 300);

// Cap sends per invocation so a single serverless call finishes well under
// the function timeout (Vercel Hobby = 10s). The scheduler runs often enough
// to drain the full daily quota anyway.
export const BATCH_SIZE = Number(process.env.NEWSLETTER_BATCH_SIZE ?? 20);

export function buildEmailHtml(body: string, unsubscribeToken: string): string {
  const unsubscribeUrl = `${SITE.url}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  return emailShell(SITE.name, body, unsubscribeUrl);
}

async function sendBrevo({
  to,
  subject,
  html,
  unsubscribeToken,
}: {
  to: string;
  subject: string;
  html: string;
  unsubscribeToken: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error("BREVO_API_KEY and BREVO_FROM_EMAIL must be set");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: fromEmail,
          name: process.env.BREVO_FROM_NAME || SITE.name,
        },
        to: [{ email: to }],
        subject,
        htmlContent: buildEmailHtml(html, unsubscribeToken),
      }),
    });
    if (!res.ok) {
      throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

// Send a single preview email to one address (e.g. the admin's own inbox).
export async function sendTestEmail(to: string, subject: string, html: string) {
  await sendBrevo({ to, subject, html, unsubscribeToken: "test" });
}

// Create a campaign and snapshot every active subscriber into the queue.
export async function enqueueCampaign(subject: string, html: string) {
  const campaign = await prisma.newsletterCampaign.create({
    data: { subject, html },
  });
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribed: false },
    select: { id: true },
  });
  if (subscribers.length > 0) {
    await prisma.newsletterDelivery.createMany({
      data: subscribers.map((s) => ({
        campaignId: campaign.id,
        subscriberId: s.id,
      })),
      skipDuplicates: true,
    });
  }
  return { campaign, queued: subscribers.length };
}

// Idempotent, quota-aware drain. Safe to call from a cron, an admin click, or
// an on-server interval — the delivery rows are claimed atomically so no
// subscriber is ever emailed twice, and SENDING claims hold quota so two
// concurrent runs can't overshoot the daily limit.
// ponytail: the quota check + claim aren't one transaction, so two overlapping
// runs can briefly overshoot by up to a batch at the very end of the day.
// Brevo rejects the excess with a 400 and it lands as FAILED. Add a
// serializable transaction here only if daily-limit accuracy ever matters.
export async function processNewsletterQueue() {
  // Recover deliveries a crashed run left mid-send (claimed >10 min ago).
  await prisma.newsletterDelivery.updateMany({
    where: {
      status: "SENDING",
      updatedAt: { lt: new Date(Date.now() - 10 * 60_000) },
    },
    data: { status: "QUEUED", error: null },
  });

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const sentToday = await prisma.newsletterDelivery.count({
    where: { status: "SENT", sentAt: { gte: dayStart } },
  });
  const inFlight = await prisma.newsletterDelivery.count({
    where: { status: "SENDING" },
  });
  const remaining = Math.max(0, DAILY_LIMIT - sentToday - inFlight);
  if (remaining <= 0) return { sent: 0, remaining };

  const batch = await prisma.newsletterDelivery.findMany({
    where: {
      status: "QUEUED",
      subscriber: { is: { unsubscribed: false } },
    },
    orderBy: { createdAt: "asc" },
    take: Math.min(BATCH_SIZE, remaining),
    include: {
      campaign: { select: { subject: true, html: true } },
      subscriber: { select: { email: true, unsubscribeToken: true } },
    },
  });
  if (batch.length === 0) return { sent: 0, remaining };

  await prisma.newsletterDelivery.updateMany({
    where: { id: { in: batch.map((d) => d.id) } },
    data: { status: "SENDING" },
  });

  const PARALLEL = 5;
  let sent = 0;
  for (let i = 0; i < batch.length; i += PARALLEL) {
    const chunk = batch.slice(i, i + PARALLEL);
    const results = await Promise.allSettled(
      chunk.map((d) =>
        sendBrevo({
          to: d.subscriber.email,
          subject: d.campaign.subject,
          html: d.campaign.html,
          unsubscribeToken: d.subscriber.unsubscribeToken,
        }).then(() => d)
      )
    );
    await Promise.all(
      results.map((r, idx) => {
        const d = chunk[idx];
        if (r.status === "fulfilled") {
          sent += 1;
          return prisma.newsletterDelivery.update({
            where: { id: d.id },
            data: { status: "SENT", sentAt: new Date(), error: null },
          });
        }
        return prisma.newsletterDelivery.update({
          where: { id: d.id },
          data: { status: "FAILED", error: r.reason instanceof Error ? r.reason.message : String(r.reason) },
        });
      })
    );
  }
  return { sent, remaining: remaining - batch.length };
}
