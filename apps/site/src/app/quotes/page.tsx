import type { Metadata } from "next";
import { SITE, pageMetadata } from "@/lib/site";
import { getQuotes } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Quotes",
  description:
    "Short ideas on habits, confidence, money and happiness from Sagar Lad's writing and talks.",
  path: "/quotes",
});

export const revalidate = 604800;

export default async function QuotesPage() {
  const quotes = await getQuotes();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Quotes", item: `${SITE.url}/quotes` },
          ],
        }}
      />
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <p className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Words to live by
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Ideas to carry with you
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Short lines on habits, confidence, money and happiness — from the
            writing and talks.
          </p>
        </div>
      </header>

      {quotes.length === 0 ? (
        <p className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-muted-foreground">
          Quotes coming soon.
        </p>
      ) : (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        {quotes.map((q) => (
          <figure
            key={q.id}
            className="card-hover flex flex-col justify-between rounded-lg border border-border bg-card p-7"
          >
            <blockquote className="font-display text-lg font-medium leading-relaxed">
              &ldquo;{q.text}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-accent-strong">
                {q.tag}
              </span>
              <span className="text-muted-foreground">— Sagar Lad</span>
            </figcaption>
          </figure>
        ))}
      </div>
      )}
    </>
  );
}
