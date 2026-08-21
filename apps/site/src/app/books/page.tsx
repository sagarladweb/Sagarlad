import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, TrendingUp, Users, Eye } from "lucide-react";
import { getPublishedBooks } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
import { METRICS } from "@/lib/metrics";
import { BookLibrary } from "@/components/books/BookLibrary";

export const metadata: Metadata = pageMetadata({
  title: "Books by Sagar Lad",
  description:
    "Practical data & cloud books by Sagar Lad — Azure, Databricks and modern data architecture. Browse the full catalogue on Amazon.",
  path: "/books",
});

export const revalidate = 604800;

const AMAZON_AUTHOR_URL =
  "https://www.amazon.com/stores/author/B0B5R12SHN/allbooks?ccs_id=0ebd2f24-24b0-4f50-bbc5-e74510a792dd";

const AUTHOR_PORTRAIT = "/images/Sagar's.png";

export default async function BooksPage() {
  const books = await getPublishedBooks("PUBLISHED");
  const total = books.length;

  return (
    <div className="overflow-x-clip">
      {/* -------- MIND UP editorial hero -------- */}
      <header className="overflow-hidden border-b border-border bg-background text-black">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-12 lg:gap-10 lg:py-32">
          {/* Portrait — layered over the blue disc */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[420px] isolate">
              <svg
                aria-hidden="true"
                className="absolute -left-12 -top-14 h-44 w-44 text-[#3F88C5] opacity-40 z-0"
              >
                <defs>
                  <pattern id="mindup-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="2.5" cy="2.5" r="1.75" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mindup-dots)" />
              </svg>

              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D21A1] z-0"
              />

              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="absolute left-1/2 top-1/2 aspect-square w-[84%] -translate-x-1/2 -translate-y-[54%] text-[#FFD51D] z-0"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="49"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="252 56"
                  strokeLinecap="round"
                  transform="rotate(-40 50 50)"
                />
              </svg>

              <Image
                src={AUTHOR_PORTRAIT}
                alt="Sagar Lad"
                width={477}
                height={523}
                priority
                className="relative z-10 h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.18)]"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="lg:col-span-7 lg:pl-6 xl:pl-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0D21A1]">
              Mindset
            </p>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
              The MIND UP Theory:
              <span className="block">Simple Shift That Will</span>
              <span className="block">
                <span className="text-[#0D21A1]">Make You </span>
                <span className="text-[#FFD51D]">Unshakable.</span>
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed">
              One simple shift to stop overthinking, break free from self-doubt
              and build an{" "}
              <span className="font-semibold text-[#0D21A1]">
                unshakable mindset
              </span>
              .
            </p>

            <div className="mt-10">
              <p className="font-display text-2xl font-bold">Sagar Lad</p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F88C5]">
                Author · Investor · Public Speaker
              </p>
            </div>

            {/* Metric stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-background/80 backdrop-blur p-4 sm:p-6 divide-x divide-border">
              {[
                { icon: TrendingUp, value: METRICS.booksSold, label: "Books sold" },
                { icon: Users, value: METRICS.bookReaders, label: "Readers worldwide" },
                { icon: Eye, value: METRICS.communityReached, label: "Community reached" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center px-2 sm:px-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3F88C5]/15 text-[#3F88C5] flex items-center justify-center mb-2">
                    <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <p className="font-display text-lg sm:text-2xl font-extrabold tracking-tight tabular-nums">{s.value}</p>
                  <p className="mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* -------- The Library -------- */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                The Library
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
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Colophon
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
