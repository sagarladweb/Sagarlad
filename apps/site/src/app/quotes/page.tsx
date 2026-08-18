import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { getQuotes } from "@/lib/content";

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
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            Quotes
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
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-7"
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
