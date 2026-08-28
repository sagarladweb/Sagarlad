import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { assertPhase2 } from "@/lib/phase";
import { getNewsletterInsertItems } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  assertPhase2();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let insert: any = { posts: [], videos: [], books: [], read: [], quotes: [] };
  try {
    insert = await getNewsletterInsertItems();
  } catch (err) {
    console.warn("[admin newsletter] DB query failed:", (err as Error).message);
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <h1 className="font-display text-2xl font-bold">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose a broadcast for your subscribers. The email templates follow
          the site brand automatically — just write.
        </p>
      </header>

      <NewsletterManager insert={insert} />
    </div>
  );
}