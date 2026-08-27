"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Item = { quote: string; name: string; role: string };

export default function TestimonialCarousel({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const count = items.length;

  const scrollTo = useCallback(
    (i: number) => {
      const el = ref.current;
      if (!el) return;
      const next = ((i % count) + count) % count;
      el.scrollTo({ left: next * el.offsetWidth, behavior: "smooth" });
      setActive(next);
    },
    [count],
  );

  /* auto-scroll */
  useEffect(() => {
    timer.current = setInterval(() => scrollTo(active + 1), 4500);
    return () => clearInterval(timer.current);
  }, [active, scrollTo]);

  /* sync active dot on manual swipe/scroll */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      if (idx !== active) setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [active]);

  /* pause on touch/hover */
  const pause = () => clearInterval(timer.current);
  const resume = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => scrollTo(active + 1), 4500);
  };

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* Track */}
      <div
        ref={ref}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((t, i) => (
          <blockquote
            key={i}
            className="card-hover snap-center shrink-0 w-full rounded-lg border border-border bg-card p-6 sm:p-8"
          >
            <p className="text-sm sm:text-base leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 text-xs text-muted-foreground">
              <strong className="text-foreground font-medium">{t.name}</strong> · {t.role}
            </footer>
          </blockquote>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-accent" : "w-1.5 bg-border hover:bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
