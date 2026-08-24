"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { DotPagination } from "@/components/ui/CarouselNav";

export type BookCarouselBook = {
  id: string;
  title: string;
  tagline: string | null;
  imageUrl: string | null;
  buyUrl: string | null;
  description: string | null;
};

const FALLBACK_DESCRIPTION =
  "A practical guide by Sagar Lad — part of the MIND UP library.";

export function BookCarousel({ books }: { books: BookCarouselBook[] }) {
  const sortedBooks = [...books].sort((a, b) => {
    const aIsMindUp = a.title.toLowerCase().includes("mind up");
    const bIsMindUp = b.title.toLowerCase().includes("mind up");
    if (aIsMindUp && !bIsMindUp) return -1;
    if (!aIsMindUp && bIsMindUp) return 1;
    return 0;
  });

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fullyVisible, setFullyVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const total = sortedBooks.length;
  const book = sortedBooks[index] ?? sortedBooks[0];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setFullyVisible(entry.isIntersecting), {
      threshold: 1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (total <= 1 || isPaused || !fullyVisible) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 8000);
    return () => clearInterval(timer);
  }, [total, isPaused, fullyVisible]);

  if (!sortedBooks.length) return null;

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group/carousel"
      aria-roledescription="carousel"
      aria-label="Featured books"
    >
      {/* Section header + counter */}
      <div className="flex items-end justify-between gap-4 mb-10 md:mb-12" data-animate>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            The library
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
            Featured books
          </h2>
        </div>
        <p
          aria-hidden="true"
          className="text-sm font-semibold text-muted-foreground tabular-nums"
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      <div className="relative flex items-center gap-3">
        {/* Prev arrow */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous book"
          className="shrink-0 grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-muted transition-colors lg:opacity-0 lg:group-hover/carousel:opacity-100 lg:transition-opacity lg:duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Book slide */}
        <div key={book.id} className="book-slide-enter min-w-0 flex-1">
          <article className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            <div className="w-full md:w-2/5 lg:w-2/5 shrink-0 flex justify-center">
              <div className="relative aspect-[3/4] w-[70vw] max-w-[300px] md:w-full">
                {book.imageUrl ? (
                  <Image
                    src={book.imageUrl}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 70vw, 400px"
                    className="object-contain drop-shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center rounded-2xl bg-muted p-6">
                    <span className="font-display text-xl font-bold text-foreground text-center">
                      {book.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:flex-1 text-center md:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-strong">
                {book.tagline ?? "The flagship book"}
              </p>
              <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold leading-snug">
                {book.title}
              </h3>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground max-w-xl line-clamp-4">
                {book.description ?? FALLBACK_DESCRIPTION}
              </p>

              <div className="mt-7 inline-block">
                <SiteLogo className="h-9 w-auto" />
              </div>
              <div className="mt-4 flex items-center justify-center md:justify-start">
                <a
                  href={book.buyUrl ?? "/books"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Get your Copy
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* Next arrow */}
        <button
          type="button"
          onClick={next}
          aria-label="Next book"
          className="shrink-0 grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-muted transition-colors lg:opacity-0 lg:group-hover/carousel:opacity-100 lg:transition-opacity lg:duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot pagination */}
      <DotPagination
        total={books.length}
        current={index}
        onChange={setIndex}
        label="book"
        className="mt-8 lg:opacity-0 lg:group-hover/carousel:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
}
