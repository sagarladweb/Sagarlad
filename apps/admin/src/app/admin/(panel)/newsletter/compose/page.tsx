import { assertPhase2 } from "@/lib/phase";
import { getNewsletterInsertItems, getQuotes } from "@/lib/content";
import { getSiteSocials } from "@/lib/social-links";
import { prisma } from "@/lib/db";
import { NewsletterComposeClient } from "@/components/admin/NewsletterComposeClient";
import type { NewsletterContent } from "@/lib/newsletterTemplates";

export const dynamic = "force-dynamic";

export default async function NewsletterComposePage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  assertPhase2();
  const params = await searchParams;
  const draftId = params.draft ?? null;

  let insert = { posts: [], videos: [], books: [], read: [], ebooks: [], quotes: [] } as { posts: { title: string; url: string }[]; videos: { title: string; url: string }[]; books: { title: string; url: string; cover?: string | null }[]; read: { title: string; url: string; cover?: string | null }[]; ebooks: { title: string; url: string; cover?: string | null }[]; quotes: { title: string; url: string }[] };
  let subscriberCount = 0;
  let dbQuotes: { id: string; text: string; tag: string | null }[] = [];
  let dbSocials: { id: string; key: string; label: string; href: string; handle: string | null; color: string | null; logoUrl?: string | null }[] = [];
  let seed: { subject: string; content: NewsletterContent; draftId?: string } | null = null;

  try {
    const [insertResult, count, quotesResult, socialsResult] = await Promise.all([
      getNewsletterInsertItems().catch(() => insert),
      prisma.newsletterSubscriber.count({ where: { unsubscribed: false } }).catch(() => 0),
      getQuotes().catch(() => []),
      getSiteSocials().catch(() => []),
    ]);
    insert = insertResult;
    subscriberCount = count;
    dbQuotes = quotesResult;
    dbSocials = socialsResult;

    // Load existing campaign/draft for editing
    if (draftId) {
      const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id: draftId },
        select: { subject: true, contentJson: true },
      });
      if (campaign?.contentJson) {
        seed = { subject: campaign.subject, content: campaign.contentJson as NewsletterContent, draftId };
      }
    }
  } catch {
    // DB down — render with empty data
  }

  return (
    <div className="-mx-4 sm:-mx-8 -my-6 sm:-my-8 h-[calc(100vh-3.5rem)] md:h-screen">
      <NewsletterComposeClient
        subscriberCount={subscriberCount}
        insert={insert}
        dbQuotes={dbQuotes}
        dbSocials={dbSocials}
        seed={seed}
      />
    </div>
  );
}
