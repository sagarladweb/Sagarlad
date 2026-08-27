"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { BookViewer } from "@/components/books/BookViewer";
import { DotPagination } from "@/components/ui/CarouselNav";
import { BookStats } from "./BookStats";
import { Pill } from "@/components/ui/Pill";

export type BookCarouselBook = {
  id: string;
  title: string;
  tagline: string | null;
  imageUrl: string | null;
  buyUrl: string | null;
  description: string | null;
  author: string | null;
};

const FALLBACK_DESCRIPTION =
  "A practical guide by Sagar Lad — part of the MIND UP library.";

/* Local cover images — keyed by title substring (lowercase) */
const LOCAL_COVERS: Record<string, { front: string; back?: string }> = {
  "mind up": {
    front: "/images/books/mindup-front.jpg",
    back: "/images/books/mindup-back.jpg",
  },
  "azure": {
    front: "/images/books/azure-front.webp",
  },
};

function getLocalCover(title: string): { front: string; back?: string } | null {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(LOCAL_COVERS)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const total = sortedBooks.length;
  const book = sortedBooks[index] ?? sortedBooks[0];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    startX.current = e.clientX;
    setDragging(true);
    setDrag(0);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDrag(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(drag) > 50) {
      if (drag < 0) next();
      else prev();
    }
    setDrag(0);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setFullyVisible(entry.isIntersecting),
      { threshold: 1 }
    );
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

  const cover = getLocalCover(book.title);
  const frontSrc = cover?.front ?? book.imageUrl ?? "";
  const backSrc = cover?.back;

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group/carousel"
      aria-roledescription="carousel"
      aria-label="Featured books"
    >
      <BookViewer
        book={{ ...book, imageUrl: frontSrc || book.imageUrl }}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />

      {/* Section Header */}
      <div className="mb-12 md:mb-16" data-animate>
        <Pill>The Library</Pill>
        <h2 className="mt-6 font-display text-3xl md:text-4xl font-bold text-[#1e293b]">
          Featured books
        </h2>
      </div>

      {/* Carousel area with side arrows */}
      <div
        className="relative touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Left arrow */}
        {total > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Previous book"
            className="btn-premium absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:grid h-12 w-12 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] shadow-sm hover:border-[#1e293b] hover:text-[#1e293b] -translate-x-1/2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Book slide */}
        <div key={book.id} className="book-slide-enter">
          <article className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-20">
            {/* 3D Book Cover */}
            <div
              className="w-full md:w-2/5 lg:w-2/5 shrink-0 flex justify-center"
              style={{ perspective: "1200px" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewerOpen(true);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                aria-label={`Open preview of ${book.title}`}
                className="relative cursor-pointer z-30 pointer-events-auto group/book"
              >
                {/* 3D Book wrapper — crossfade on hover when back cover exists */}
                <div className="relative w-[200px] sm:w-[240px] md:w-full aspect-[3/4]">
                  {/* Front cover */}
                  <div
                    className={`absolute inset-0 rounded-r-md overflow-hidden z-20 ${backSrc ? "book-front" : "book-3d-hover"}`}
                    style={!backSrc ? { transform: "rotateY(-6deg)" } : undefined}
                  >
                    {frontSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={frontSrc}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-r-md"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 rounded-r-md flex flex-col"
                        style={{
                          background: "linear-gradient(160deg, #0d21a1 0%, #1a3ab8 35%, #0d21a1 65%, #091780 100%)",
                        }}
                      >
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#ffd51d] to-transparent" />
                        <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-8 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
                            {book.author ?? "Sagar Lad"}
                          </p>
                          <div className="my-auto">
                            <div className="w-10 h-[1px] bg-white/20 mx-auto mb-5" />
                            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                              {book.title}
                            </h3>
                            {book.tagline && (
                              <p className="mt-3 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-[#ffd51d]">
                                {book.tagline}
                              </p>
                            )}
                            <div className="w-10 h-[1px] bg-white/20 mx-auto mt-5" />
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30">
                            Official Edition
                          </p>
                        </div>
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#ffd51d] to-transparent" />
                      </div>
                    )}
                  </div>

                  {/* Back cover (only for books that have one) */}
                  {backSrc && (
                    <div className="absolute inset-0 rounded-r-md overflow-hidden z-10 book-back">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={backSrc}
                        alt={`${book.title} — back cover`}
                        className="absolute inset-0 w-full h-full object-cover rounded-r-md"
                      />
                    </div>
                  )}

                  {/* Spine — left edge */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[18px] rounded-l-sm z-30"
                    style={{
                      background:
                        "linear-gradient(to right, #091780 0%, #0d21a1 40%, #1a3ab8 70%, transparent 100%)",
                    }}
                  />

                  {/* Paper pages — right edge */}
                  <div
                    className="absolute right-0 top-[3%] bottom-[3%] w-[6px] z-30"
                    style={{
                      background:
                        "repeating-linear-gradient(to bottom, #faf9f6 0px, #faf9f6 2px, #e8e6e1 2px, #e8e6e1 3px)",
                      borderRadius: "0 2px 2px 0",
                      boxShadow: "2px 0 6px rgba(0,0,0,0.12)",
                    }}
                  />

                  {/* Multi-layer depth shadow */}
                  <div
                    className="absolute inset-0 rounded-r-md z-0"
                    style={{
                      boxShadow:
                        "8px 8px 20px rgba(0,0,0,0.22), 12px 12px 40px rgba(0,0,0,0.12), 20px 20px 60px rgba(0,0,0,0.08), inset -1px 0 0 rgba(255,255,255,0.1)",
                    }}
                  />
                </div>

                {/* Hover hint */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/book:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-[11px] font-medium text-[#94a3b8] whitespace-nowrap">
                    {backSrc ? "Hover to flip · Click to preview" : "Click to preview"}
                  </span>
                </div>
              </button>
            </div>

            {/* Text Content */}
            <div className="w-full md:flex-1 text-center md:text-left">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] border border-[#e2e8f0] rounded-full px-4 py-1">
                {book.tagline ?? "The flagship book"}
              </span>

              <h3 className="mt-6 font-display text-2xl md:text-3xl font-bold leading-snug text-[#1e293b]">
                {book.title}
              </h3>

              <p className="mt-5 text-sm md:text-base leading-loose text-[#64748b] max-w-xl">
                {book.description ?? FALLBACK_DESCRIPTION}
              </p>

              {/* Signature */}
              <div className="mt-8">
                <SiteLogo className="h-14 sm:h-16 md:h-18 w-auto logo-black" />
              </div>

              {/* CTA button */}
              <div className="mt-8 flex items-center justify-center md:justify-start">
                <a
                  href={book.buyUrl ?? "/books"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Get a copy
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* Right arrow */}
        {total > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next book"
            className="btn-premium absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:grid h-12 w-12 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] shadow-sm hover:border-[#1e293b] hover:text-[#1e293b] translate-x-1/2"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Dot Pagination */}
      {total > 1 && (
        <div className="mt-10 flex justify-center">
          <DotPagination total={total} current={index} onChange={setIndex} />
        </div>
      )}

      {/* Mobile arrows row */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous book"
            className="btn-premium grid h-10 w-10 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] hover:border-[#1e293b] hover:text-[#1e293b]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next book"
            className="btn-premium grid h-10 w-10 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] hover:border-[#1e293b] hover:text-[#1e293b]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Book Stats — inside the section */}
      <div className="mt-14 md:mt-20 pt-8 border-t border-[#e2e8f0]/40">
        <BookStats />
      </div>
    </div>
  );
}
