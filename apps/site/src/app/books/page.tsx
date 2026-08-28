import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getPublishedBooks } from "@/lib/content";
import { SITE, pageMetadata } from "@/lib/site";
import { BookLibrary } from "@/components/books/BookLibrary";
import { BookHeroMetrics } from "@/components/books/BookHeroMetrics";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Books by Sagar Lad",
  description:
    "Practical data & cloud books by Sagar Lad — Azure, Databricks and modern data architecture. Browse the full catalogue on Amazon.",
  path: "/books",
});

export const revalidate = 604800;

const AMAZON_AUTHOR_URL =
  "https://www.amazon.com/stores/author/B0B5R12SHN/allbooks?ccs_id=0ebd2f24-24b0-4f50-bbc5-e74510a792dd";

export default async function BooksPage() {
  const books = await getPublishedBooks("PUBLISHED");
  const total = books.length;

  return (
    <div className="overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Books", item: SITE.url + "/books" },
          ],
        }}
      />

      {/* -------- Hero -------- */}
      <header className="relative overflow-hidden border-b border-border bg-background">
        {/* Subtle warm accent behind portrait */}
        <div
          className="absolute z-0"
          style={{
            width: "500px",
            height: "500px",
            left: "0%",
            top: "15%",
            background: "radial-gradient(circle, rgba(255,213,29,0.05) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-20 mx-auto max-w-7xl px-6 sm:px-8 pt-10 pb-14 sm:pt-16 sm:pb-20">
          <div className="grid grid-cols-1 items-center lg:grid-cols-12 gap-12 lg:gap-16">
            {/* ── Portrait ── */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start" data-animate="left">
              <div className="relative w-full max-w-[410px] mx-auto">
                <Image
                  src="/images/section.png"
                  alt="Sagar Lad"
                  width={800}
                  height={890}
                  priority
                  className="relative z-10 h-auto w-full"
                  style={{
                    transform: "scale(1.1) translate(-46px, -11px)",
                    maskImage: "linear-gradient(to top, transparent 0%, black 21%, black 100%)",
                    WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 21%, black 100%)",
                  }}
                />
              </div>
            </div>

            {/* ── Copy + Metrics ── */}
            <div className="lg:col-span-7 flex flex-col" data-animate-group="up">
              <div data-animate-item>
                <span className="inline-block w-fit text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/60 bg-brand/5 border border-brand/10 rounded-full px-5 py-2">
                  About the book
                </span>
              </div>

              <div data-animate-item className="mt-7">
                <h1 className="font-display text-[2.75rem] sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.05] tracking-tight text-foreground">
                  The MIND UP
                  <br />
                  Theory: Simple
                  <br />
                  Shift That Will
                  <br />
                  <span className="text-accent">Make You Unshakable.</span>
                </h1>
              </div>

              <div data-animate-item>
                <p className="mt-7 max-w-lg text-[15px] leading-[1.8] text-muted-foreground">
                  One simple shift to stop overthinking, break free from
                  self-doubt and build an unshakable mindset.
                </p>
              </div>

              <div data-animate-item className="mt-10">
                <p className="font-display text-xl font-medium tracking-tight text-foreground">
                  Sagar Lad
                </p>
                <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                  Author · Investor · Public Speaker
                </p>
              </div>

              <div data-animate-item className="mt-10 w-full max-w-lg">
                <BookHeroMetrics />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* -------- The Library -------- */}
      <section className="card-hover border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4" data-animate>
            <div>
              <p className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
                All books
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Every book, on one shelf.
              </h2>
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {String(total).padStart(2, "0")} titles
            </p>
          </div>

          <div className="mt-10">
            <BookLibrary books={books} variant="published" />
          </div>
        </div>
      </section>

      {/* -------- Colophon -------- */}
      <section className="bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-24" data-animate>
          <p className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Details
          </p>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            All titles are available worldwide in paperback and Kindle from
            Amazon. For the complete catalogue — including earlier and
            out-of-print works — visit the author page.
          </p>
          <a
            href={AMAZON_AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-brand-light decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            amazon.com/stores/author/B0B5R12SHN <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
