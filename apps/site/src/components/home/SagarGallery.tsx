"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const photos = [
  { src: "/images/sagar-author.png", alt: "Sagar Lad", className: "object-top" },
  { src: "/images/heroes/hero.webp", alt: "Sagar Lad portrait", className: "object-top" },
  { src: "/images/heroes/speaking.webp", alt: "Sagar Lad speaking on stage", className: "object-center" },
  { src: "/images/heroes/hero-home.webp", alt: "Sagar Lad", className: "object-center" },
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
    <section className="border-b border-border bg-background py-14 md:py-16" aria-label="Get to know Sagar">
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
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="100vw"
                  className={`object-cover ${p.className}`}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                />
              </figure>
            ))}
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 backdrop-blur border border-border text-foreground shadow-lg hover:bg-background transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === photos.length - 1}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 backdrop-blur border border-border text-foreground shadow-lg hover:bg-background transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2" data-animate>
            {photos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-2 bg-foreground/15 hover:bg-foreground/30"
                }`}
              />
            ))}
          </div>
        )}

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