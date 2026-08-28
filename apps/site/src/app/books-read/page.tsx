import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BookLibrary } from "@/components/books/BookLibrary";
import { pageMetadata } from "@/lib/site";
import { getPublishedBooks } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Books I've Read",
  description:
    "A running list of the books that have shaped my thinking — with the one clear lesson each one left me with.",
  path: "/books-read",
});

export const revalidate = 604800;

const FALLBACK_READ_BOOKS = [
  { id: "fb-bk-r1", type: "READ", title: "Atomic Habits", author: "James Clear", tagline: "Tiny changes, remarkable results", description: "A practical guide to building good habits and breaking bad ones. Clear breaks down the science of habit formation into four simple laws.", learning: "Systems matter more than goals — design your environment for success", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 1 },
  { id: "fb-bk-r2", type: "READ", title: "The Psychology of Money", author: "Morgan Housel", tagline: "Timeless lessons on wealth, greed, and happiness", description: "Housel explores how people think about money — the weird ways we make decisions, the role of luck, and why doing nothing is often the best financial strategy.", learning: "Wealth is what you don't see — it's the money not spent", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 2 },
  { id: "fb-bk-r3", type: "READ", title: "Think and Grow Rich", author: "Napoleon Hill", tagline: "The landmark bestseller now revised and updated", description: "The 1937 classic that introduced the idea that success begins with a burning desire and a definite plan. Revised with modern commentary.", learning: "Desire backed by definite purpose is the starting point of all achievement", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 3 },
  { id: "fb-bk-r4", type: "READ", title: "The Alchemist", author: "Paulo Coelho", tagline: "A fable about following your dreams", description: "A mystical story about Santiago, an Andalusian shepherd boy who travels from Spain to Egypt in search of treasure buried near the Pyramids.", learning: "When you want something, all the universe conspires to help you achieve it", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 4 },
  { id: "fb-bk-r5", type: "READ", title: "Deep Work", author: "Cal Newport", tagline: "Rules for focused success in a distracted world", description: "Newport makes the case that the ability to focus without distraction is becoming increasingly rare and increasingly valuable in today's economy.", learning: "Focus is a skill that can be trained — protect your attention like your most valuable asset", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 5 },
];

export default async function BooksReadPage() {
  const dbBooks = await getPublishedBooks("READ");
  const books = dbBooks.length > 0 ? dbBooks : FALLBACK_READ_BOOKS;

  return (
    <div className="overflow-x-clip">
      {/* Hero — Brand color gradient */}
      <header className="relative overflow-hidden border-b border-border py-16 md:py-24">
        {/* Brand navy gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1930] via-[#0d21a1]/90 to-[#0A1930] z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d21a1]/80 via-transparent to-accent/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10" />
        {/* Subtle mesh texture */}
        <div
          className="absolute inset-0 opacity-[0.04] z-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)",
          }}
        />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6">
          <p className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent/90 border border-accent/30 rounded-full px-4 py-1.5 bg-accent/10 backdrop-blur-sm">
            Books I read
          </p>
          <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold tracking-tight text-white">
            What&apos;s on my shelf
          </h1>
          <p className="mt-4 max-w-2xl text-white/60 leading-relaxed text-lg">
            Books that changed how I think — and the one clear lesson each one left me with.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {books.length === 0 ? (
          <p className="text-center text-muted-foreground">No books yet.</p>
        ) : (
          <BookLibrary books={books} variant="read" />
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-4"
          >
            Want books I&apos;ve written? Browse them <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}