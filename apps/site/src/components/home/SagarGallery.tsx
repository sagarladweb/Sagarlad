"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { DotPagination } from "@/components/ui/CarouselNav";

const photos = [
  { src: "/images/profile/about.webp", alt: "Sagar Lad", className: "object-top" },
  { src: "/images/profile/about-2.webp", alt: "Sagar Lad", className: "object-center" },
  { src: "/images/profile/about-3b.webp", alt: "Sagar Lad", className: "object-center" },
  { src: "/images/profile/about-4.webp", alt: "Sagar Lad", className: "object-center" },
  { src: "/images/profile/about-5.webp", alt: "Sagar Lad", className: "object-center" },
  { src: "/images/profile/about-6.webp", alt: "Sagar Lad", className: "object-top" },
];

export function SagarGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const last = photos.length - 1;
    const clamped = Math.max(0, Math.min(i, last));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  };

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(i);
  }

  return (
    <section className="border-b border-border bg-background py-16 md:py-24" aria-label="Get to know Sagar">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="relative" data-animate>
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar scroll-smooth rounded-2xl border border-border"
          >
            {photos.map((p) => (
              <figure
                key={p.src}
                className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className={`absolute inset-0 w-full h-full object-cover ${p.className}`}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                />
              </figure>
            ))}
          </div>

          {/* Arrows — vertically centered on edges */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur border border-border text-foreground shadow-lg hover:bg-background transition-colors disabled:opacity-40 z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === photos.length - 1}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur border border-border text-foreground shadow-lg hover:bg-background transition-colors disabled:opacity-40 z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
        </div>

        <DotPagination
          total={photos.length}
          current={index}
          onChange={goTo}
          label="photo"
          className="mt-4"
        />

        <div className="mt-6 flex flex-col items-center gap-2.5 text-center" data-animate>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground">
            It&apos;s your friend, Sagar.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            One practical idea, every week — shared like a friend would.
          </p>
          <Link
            href="/about"
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-95 transition-opacity"
          >
            Know me better <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
