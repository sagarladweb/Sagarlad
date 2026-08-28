"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { GraduationCap, Briefcase, Mic, PenTool } from "lucide-react";

type TimelineNode = {
  year: string;
  title: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  href?: string;
  hrefLabel?: string;
};

const nodes: TimelineNode[] = [
  {
    year: "2009",
    title: "School Education",
    description:
      "Years of relentless effort pay off — I earn my place at a top university for computer engineering.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
  },
  {
    year: "2009 – 2013",
    title: "B.E. Computer Engineering",
    description:
      "BVM College — the foundation of my technical career begins in earnest.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: "TCS",
    description:
      "My professional journey begins — and soon takes me to Europe.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
  },
  {
    year: "2019 – 2020",
    title: "PG in Data Science",
    description:
      "IIIT Bangalore — the year that reshaped how I think, learn, and solve problems.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books Published",
    description:
      "First book in February 2022, sixth in March 2026 — writing alongside a full career.",
    tag: "Author",
    icon: PenTool,
    image: "/images/books/mindup-front.jpg",
    href: "/books",
    hrefLabel: "View books",
  },
  {
    year: "2025 – 2026",
    title: "Masters in Gen AI",
    description:
      "Purdue University — sharpening the frontier, artificial intelligence done right.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2026",
    title: "First TEDx Speech",
    description:
      "Give a speech on AI to the TEDx stage.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
  },
];

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const toggle = useCallback(
    (i: number) => setActive((prev) => (prev === i ? null : i)),
    []
  );

  // Close on outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Horizontal grab-to-drag
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      // Don't interfere with card clicks
      if ((e.target as HTMLElement).closest("[data-tl-card]")) return;
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = "grabbing";
      track.setPointerCapture(e.pointerId);
    };
    const onPointerUp = (e: PointerEvent) => {
      isDown = false;
      track.style.cursor = "grab";
      track.releasePointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.5;
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    track.addEventListener("pointermove", onPointerMove);

    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      track.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  // GSAP reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-tl-heading]",
        { opacity: 0, y: 36, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );

      gsap.fromTo(
        "[data-tl-dot]",
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(2)",
          scrollTrigger: { trigger: trackRef.current, start: "top 85%" },
        }
      );

      gsap.fromTo(
        "[data-tl-line]",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: trackRef.current, start: "top 80%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 border-b border-border bg-background overflow-hidden"
      aria-label="Journey timeline"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-14">
        <div className="text-center" data-tl-heading>
          <span className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Where it started &amp; key moments
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            The story, in dates
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Education, career, books, and the first talk — every milestone that
            made today possible.
          </p>
        </div>
      </div>

      {/* Horizontal scroll track — same on all viewports */}
      <div
        ref={trackRef}
        className="overflow-x-auto overflow-y-visible cursor-grab px-6 sm:px-10 no-scrollbar"
        style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: `${nodes.length * 300 + 120}px` }}
        >
          {/* Axis line */}
          <div
            aria-hidden="true"
            data-tl-line
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent origin-left"
            style={{ top: "180px" }}
          />

          {/* Nodes */}
          <div
            className="relative flex items-start"
            style={{ minHeight: "440px" }}
          >
            {nodes.map((n, i) => {
              const Icon = n.icon;
              const above = i % 2 === 0;
              const isOpen = active === i;

              return (
                <div
                  key={n.title}
                  className="relative flex flex-col items-center"
                  style={{ width: "300px", flexShrink: 0 }}
                >
                  {/* Dot on axis */}
                  <button
                    data-tl-dot
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-label={`${n.title} — ${n.year}`}
                    className="absolute left-1/2 -translate-x-1/2 z-20 h-4 w-4 rounded-full border-[2.5px] border-brand bg-background transition-all duration-300 hover:scale-150 hover:shadow-[0_0_0_8px_rgba(13,33,161,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    style={{ top: "174px" }}
                  />

                  {/* Year label — always visible */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
                    style={{
                      top: above ? "140px" : "198px",
                    }}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isOpen ? "text-brand" : "text-muted-foreground"
                      }`}
                    >
                      {n.year}
                    </span>
                  </div>

                  {/* Connector line */}
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-px w-px transition-all duration-500"
                    style={{
                      height: isOpen ? "48px" : "28px",
                      top: above ? "152px" : "186px",
                      background: isOpen
                        ? "var(--brand)"
                        : "rgba(13,33,161,0.12)",
                    }}
                  />

                  {/* Card */}
                  <div
                    data-tl-card
                    className={`absolute left-1/2 -translate-x-1/2 w-[260px] transition-all duration-500 ease-out z-30 ${
                      isOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                    style={{
                      [above ? "bottom" : "top"]: "228px",
                    }}
                  >
                    <div className="rounded-2xl border border-white/25 bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                      {/* Image */}
                      {n.image && (
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src={n.image}
                            alt={n.title}
                            fill
                            sizes="260px"
                            className="object-cover object-top transition-transform duration-700 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          {/* Tag badge on image */}
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                            <Icon className="w-3 h-3" />
                            {n.tag}
                          </span>
                        </div>
                      )}

                      <div className="p-4">
                        <h3 className="font-display text-sm font-bold leading-snug text-foreground">
                          {n.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                          {n.description}
                        </p>
                        {n.href && (
                          <Link
                            href={n.href}
                            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {n.hrefLabel ?? "Learn more"} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center mt-6 text-xs text-muted-foreground/50 select-none">
        Tap a dot to explore · drag to scroll
      </p>
    </section>
  );
}
