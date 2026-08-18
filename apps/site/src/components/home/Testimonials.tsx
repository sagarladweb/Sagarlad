"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Quote as QuoteIcon,
} from "lucide-react";

const testimonials = [
  {
    quote:
      "Proactive result oriented, responsible and technically sound. Ready to pull all his energies and time to get the job done.",
    name: "Manoj Kumar",
    role: "Enterprise Cloud Architect",
  },
  {
    quote:
      "Sagar is very dedicated to his job. He quickly understands what you need and delivers very promptly.",
    name: "Traas Evelyn",
    role: "Senior Coordinator, ABN AMRO Private Banking",
  },
  {
    quote:
      "Sagar is really good at what he does, he is always a team player to rely on and a continuous learner. It was a good learning experience working alongside him in setting up our applications initially.",
    name: "Vinod Kolli",
    role: "Domain Architect · Data Lineage · Data Marketplace · Data Governance",
  },
  {
    quote:
      "I worked with Sagar on different projects. Sagar is always keen to rapidly pick up additional knowledge that is required to get the job done. He also keeps his cool in stressful moments and clearly communicates with the other project team members in order to reach the team goal.",
    name: "Glenn De Boeck",
    role: "Head Digital Office & Business Analytics, ABN AMRO",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);
  const total = testimonials.length;

  const go = useCallback((next: number) => {
    setIndex(((next % total) + total) % total);
  }, [total]);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onPointerDown = (e: React.PointerEvent) => {
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
    if (Math.abs(drag) > 70) {
      if (drag < 0) next();
      else prev();
    }
    setDrag(0);
  };

  const t = testimonials[index];

  return (
    <section className="py-20 md:py-24 border-b border-border bg-card/40" aria-label="Testimonials">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center" data-animate-group>
          <p data-animate-item className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            Testimonials
          </p>
          <h2 data-animate-item className="mt-3 font-display text-3xl md:text-4xl font-bold">
            What people say
          </h2>
        </div>

        <div
          data-animate="zoom"
          className="mt-12 relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 text-center touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <QuoteIcon className="w-10 h-10 mx-auto text-brand-light" aria-hidden="true" />
          <blockquote className="mt-6 font-display text-xl sm:text-2xl md:text-3xl font-bold leading-snug min-h-[120px] sm:min-h-[140px] flex items-center justify-center">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <p className="mt-6 font-semibold">{t.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-brand-light/10 hover:text-brand hover:border-brand-light/40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-brand-light/10 hover:text-brand hover:border-brand-light/40 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}