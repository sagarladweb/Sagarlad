"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { GraduationCap, Briefcase, Mic, PenTool, BookOpen } from "lucide-react";

type TimelineNode = {
  year: string;
  title: string;
  oneLiner: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  imageAlt?: string;
  href?: string;
  hrefLabel?: string;
};

const nodes: TimelineNode[] = [
  {
    year: "2009",
    title: "School Education",
    oneLiner: "The dream begins",
    description:
      "Years of relentless effort in a small town in Gujarat pay off — earning a place at a top university for computer engineering. A kid from a modest home dares to dream.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
  },
  {
    year: "2009 – 2013",
    title: "B.E. Computer Engineering",
    oneLiner: "Building the foundation",
    description:
      "BVM College, Gujarat — four years of deep technical learning, late-night coding sessions, and the discipline that would shape a career in data and AI.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: "TCS — Career Begins",
    oneLiner: "From India to Europe",
    description:
      "Joining Tata Consultancy Services marks the start of a professional journey that soon takes me across continents — working with CXOs, leading data transformations across Europe.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
  },
  {
    year: "2019 – 2020",
    title: "PG in Data Science",
    oneLiner: "Reshaping how I think",
    description:
      "IIIT Bangalore — the year that changed everything. Statistical thinking, machine learning, and a whole new lens on solving real-world problems.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books Published",
    oneLiner: "Writing alongside a career",
    description:
      "First book in February 2022, sixth in March 2026. Finance, AI, habits, self-growth — each book a chapter of what I learned the hard way, so others don't have to.",
    tag: "Author",
    icon: PenTool,
    image: "/images/books/mindup-front.jpg",
    href: "/books",
    hrefLabel: "View all books",
  },
  {
    year: "2025 – 2026",
    title: "Masters in Gen AI",
    oneLiner: "Sharpening the frontier",
    description:
      "Purdue University — diving deep into artificial intelligence at the frontier. Learning to build AI systems that are responsible, practical, and genuinely useful.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/speaking/candid-presentation.webp",
  },
  {
    year: "2026",
    title: "First TEDx Speech",
    oneLiner: "AI on the big stage",
    description:
      "Taking the TEDx stage to talk about AI — translating years of hands-on experience into a message that reaches beyond the tech community.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
  },
];

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const hasAutoScrolled = useRef(false);

  const toggle = useCallback(
    (i: number) => setActive((prev) => (prev === i ? null : i)),
    []
  );

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Horizontal grab-to-drag — NO pointer capture so dots still get clicks
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let didDrag = false;

    const onPointerDown = (e: PointerEvent) => {
      // Only start drag from the track background, not from dots or cards
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("[data-tl-card]") || target.closest("a")) return;
      isDown = true;
      didDrag = false;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      isDown = false;
      track.style.cursor = "grab";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      const dx = x - startX;
      if (Math.abs(dx) > 3) didDrag = true;
      track.scrollLeft = scrollLeft - dx * 1.5;
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

  // GSAP reveal + auto-scroll + auto-open first card
  useEffect(() => {
    const el = sectionRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Heading
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

      // Dots pop in
      gsap.fromTo(
        "[data-tl-dot]",
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(2)",
          scrollTrigger: { trigger: track, start: "top 85%" },
        }
      );

      // Axis line draws
      gsap.fromTo(
        "[data-tl-line]",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: track, start: "top 80%" },
        }
      );

      // Auto-scroll: when section enters viewport, smoothly scroll track to center first card, then open it
      ScrollTrigger.create({
        trigger: el,
        start: "top 60%",
        once: true,
        onEnter: () => {
          if (hasAutoScrolled.current) return;
          hasAutoScrolled.current = true;

          // Scroll track so first node is centered
          const firstDot = track.querySelector("[data-tl-dot]") as HTMLElement | null;
          if (firstDot) {
            const dotRect = firstDot.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            const offset = dotRect.left - trackRect.left - trackRect.width / 2 + dotRect.width / 2;

            gsap.to(track, {
              scrollLeft: track.scrollLeft + offset,
              duration: 1,
              ease: "power2.inOut",
              delay: 0.6,
              onComplete: () => {
                // Open first card after scroll settles
                setActive(0);
              },
            });
          }
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  // Scroll active card into view when active changes
  useEffect(() => {
    const track = trackRef.current;
    if (active === null || !track) return;

    const dots = track.querySelectorAll("[data-tl-dot]");
    const dot = dots[active] as HTMLElement | undefined;
    if (!dot) return;

    const dotRect = dot.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    // If dot is out of view, scroll it into center
    if (dotRect.left < trackRect.left + 40 || dotRect.right > trackRect.right - 40) {
      const offset = dotRect.left - trackRect.left - trackRect.width / 2 + dotRect.width / 2;
      track.scrollTo({ left: track.scrollLeft + offset, behavior: "smooth" });
    }
  }, [active]);

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
            made today possible. Tap a dot to explore.
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
            style={{ minHeight: "460px" }}
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
                    className={`absolute left-1/2 -translate-x-1/2 z-20 h-4 w-4 rounded-full border-[2.5px] border-brand transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      isOpen
                        ? "bg-brand scale-150 shadow-[0_0_0_8px_rgba(13,33,161,0.15)]"
                        : "bg-background hover:scale-125 hover:shadow-[0_0_0_6px_rgba(13,33,161,0.1)]"
                    }`}
                    style={{ top: "174px" }}
                  />

                  {/* One-liner — always visible below year */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
                    style={{ top: above ? "126px" : "198px" }}
                  >
                    <span
                      className={`block text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isOpen ? "text-brand" : "text-muted-foreground/70"
                      }`}
                    >
                      {n.year}
                    </span>
                    <span
                      className={`block mt-1 text-xs font-medium transition-colors duration-300 ${
                        isOpen ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {n.oneLiner}
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
                    className={`absolute left-1/2 -translate-x-1/2 w-[260px] sm:w-[280px] z-30 ${
                      isOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                    style={{
                      transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                      [above ? "bottom" : "top"]: "228px",
                    }}
                  >
                    <div className="rounded-2xl border border-white/25 bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                      {/* Image */}
                      {n.image && (
                        <div className="relative h-36 sm:h-40 w-full overflow-hidden">
                          <Image
                            src={n.image}
                            alt={n.imageAlt ?? n.title}
                            fill
                            sizes="(max-width: 640px) 280px, 280px"
                            className="object-cover object-right-top sm:object-top transition-transform duration-700 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                          {/* Tag badge on image */}
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                            <Icon className="w-3 h-3" />
                            {n.tag}
                          </span>
                        </div>
                      )}

                      {/* Fallback visual when no image — icon hero */}
                      {!n.image && (
                        <div className="relative h-24 w-full bg-gradient-to-br from-brand/10 via-brand/5 to-transparent flex items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-brand/10 grid place-items-center text-brand">
                            <Icon className="w-7 h-7" />
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand/60 mb-1">
                          {n.year}
                        </p>
                        <h3 className="font-display text-sm font-bold leading-snug text-foreground">
                          {n.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                          {n.description}
                        </p>
                        {n.href && (
                          <Link
                            href={n.href}
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BookOpen className="w-3 h-3" />
                            {n.hrefLabel ?? "Learn more"}
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
