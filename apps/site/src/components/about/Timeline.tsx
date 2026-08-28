"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  GraduationCap,
  Briefcase,
  Mic,
  PenTool,
  BookOpen,
} from "lucide-react";

type Node = {
  year: string;
  title: string;
  oneLiner: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  href?: string;
  hrefLabel?: string;
};

const nodes: Node[] = [
  {
    year: "2009",
    title: "School Days",
    oneLiner: "Where it all began",
    description:
      "Growing up in Gujarat, I fell in love with computers. Late nights, broken code, and a stubborn belief that tech could change everything.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
  },
  {
    year: "2009 – 2013",
    title: "Engineering College",
    oneLiner: "Four years of building",
    description:
      "BVM College was where theory met reality. More time in the lab than the classroom — and those habits shaped the engineer I became.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: "Joined TCS",
    oneLiner: "First job, first flight",
    description:
      "From a small town in Gujarat to boardrooms in Europe. TCS gave me the world — and I made the most of every opportunity.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
  },
  {
    year: "2019 – 2020",
    title: "Data Science",
    oneLiner: "A new way to think",
    description:
      "IIIT Bangalore changed how I see problems. Statistics, ML, and a whole new toolkit for solving real-world challenges.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books",
    oneLiner: "Words that outlive me",
    description:
      "Finance, AI, habits, growth — each book from a place of wanting to help. Not theory from a desk, but lessons from the field.",
    tag: "Author",
    icon: PenTool,
    image: "/images/books/mindup-front.jpg",
    href: "/books",
    hrefLabel: "View all books",
  },
  {
    year: "2025 – 2026",
    title: "Masters in Gen AI",
    oneLiner: "Staying ahead of the curve",
    description:
      "Purdue University — diving deep into AI systems that are responsible, practical, and built for the real world.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/speaking/candid-presentation.webp",
  },
  {
    year: "2026",
    title: "TEDx Speaker",
    oneLiner: "AI on the big stage",
    description:
      "Taking the TEDx stage to share what years of hands-on experience taught me about AI and decision-making.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
  },
];

/* Wave y-positions for 7 nodes (oscillating around center) */
const WAVE_Y = [42, 58, 42, 58, 42, 58, 42];

function buildWavePath(width: number, height: number): string {
  const pts = nodes.map((_, i) => ({
    x: (i / (nodes.length - 1)) * width,
    y: (WAVE_Y[i] / 100) * height,
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cx1 = prev.x + (curr.x - prev.x) * 0.5;
    const cy1 = prev.y;
    const cx2 = prev.x + (curr.x - prev.x) * 0.5;
    const cy2 = curr.y;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = useCallback((i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const show = useCallback((i: number) => {
    setOpenSet((prev) => new Set(prev).add(i));
  }, []);

  // Close all on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSet(new Set());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // GSAP animations
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-tl-heading]",
        { opacity: 0, y: 30, filter: "blur(3px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        }
      );

      gsap.fromTo(
        "[data-tl-scroll]",
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 75%" },
          onComplete: () => setOpenSet(new Set([0])),
        }
      );

      gsap.fromTo(
        "[data-tl-dot]",
        { scale: 0 },
        {
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(2.5)",
          delay: 0.3,
          scrollTrigger: { trigger: el, start: "top 75%" },
        }
      );

      // Animate wave path drawing
      gsap.fromTo(
        "[data-tl-wave-path]",
        { strokeDashoffset: 2000 },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.inOut",
          delay: 0.1,
          scrollTrigger: { trigger: el, start: "top 75%" },
        }
      );

      // Dotted connector lines animate in
      gsap.fromTo(
        "[data-tl-connector]",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.5,
          scrollTrigger: { trigger: el, start: "top 75%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const trackWidth = 1100;
  const trackHeight = 180;
  const wavePath = buildWavePath(trackWidth, trackHeight);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 border-b border-border bg-background overflow-hidden"
      aria-label="Journey timeline"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 md:mb-14">
        <div className="text-center" data-tl-heading>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand border border-brand/20 rounded-full px-4 py-1.5 bg-transparent">
            Where it started &amp; key moments
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            The story, in dates
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Hover or tap any dot to read the chapter behind it.
          </p>
        </div>
      </div>

      {/* ── Desktop: wave timeline with horizontal scroll ── */}
      <div
        ref={scrollRef}
        data-tl-scroll
        className="hidden md:block overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: `${trackWidth}px`, height: `${trackHeight + 280}px`, minWidth: "900px" }}
        >
          {/* SVG wave axis */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={trackWidth}
            height={trackHeight}
            viewBox={`0 0 ${trackWidth} ${trackHeight}`}
            fill="none"
            style={{ top: "60px" }}
          >
            {/* Shadow/glow */}
            <path
              d={wavePath}
              stroke="rgba(13,33,161,0.06)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Main wave */}
            <path
              data-tl-wave-path
              d={wavePath}
              stroke="rgba(13,33,161,0.2)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="2000"
              strokeDashoffset="2000"
            />
            {/* Animated dots along the wave */}
            <path
              d={wavePath}
              stroke="rgba(13,33,161,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="4 8"
              className="animate-wave-dots"
            />
          </svg>

          {/* Nodes */}
          {nodes.map((n, i) => {
            const Icon = n.icon;
            const isOpen = openSet.has(i);
            const x = (i / (nodes.length - 1)) * trackWidth;
            const y = (WAVE_Y[i] / 100) * trackHeight + 60;
            const above = WAVE_Y[i] < 50;

            return (
              <div
                key={n.title}
                className="absolute"
                style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
              >
                {/* Connector line (dotted) */}
                <div
                  data-tl-connector
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 w-px"
                  style={{
                    height: isOpen ? "56px" : "28px",
                    top: above ? undefined : "12px",
                    bottom: above ? "12px" : undefined,
                    background: isOpen
                      ? "repeating-linear-gradient(to bottom, var(--brand) 0, var(--brand) 3px, transparent 3px, transparent 7px)"
                      : "repeating-linear-gradient(to bottom, rgba(13,33,161,0.15) 0, rgba(13,33,161,0.15) 3px, transparent 3px, transparent 7px)",
                    transformOrigin: above ? "bottom center" : "top center",
                    transition: "height 0.3s ease-out",
                  }}
                />

                {/* Dot */}
                <button
                  data-tl-dot
                  onMouseEnter={() => show(i)}
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-label={`${n.title} — ${n.year}`}
                  className="relative z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-full"
                >
                  <span
                    className={`block h-4 w-4 rounded-full border-[2.5px] border-brand transition-all duration-300 ${
                      isOpen
                        ? "bg-brand scale-150 shadow-[0_0_0_8px_rgba(13,33,161,0.12)]"
                        : "bg-background hover:scale-125 hover:shadow-[0_0_0_6px_rgba(13,33,161,0.08)]"
                    }`}
                  />
                </button>

                {/* Year label */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 whitespace-nowrap"
                  style={{
                    top: above ? "calc(100% + 8px)" : undefined,
                    bottom: above ? undefined : "calc(100% + 8px)",
                  }}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                      isOpen ? "text-brand" : "text-muted-foreground"
                    }`}
                  >
                    {n.year}
                  </span>
                </div>

                {/* Card */}
                <div
                  data-tl-card
                  className="absolute left-1/2 z-30"
                  style={{
                    top: above ? undefined : "calc(100% + 30px)",
                    bottom: above ? "calc(100% + 30px)" : undefined,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "210px",
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    {n.image && (
                      <div className="relative h-24 w-full overflow-hidden">
                        <Image
                          src={n.image}
                          alt={n.title}
                          fill
                          sizes="210px"
                          className="object-cover object-right-top sm:object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/40 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                          <Icon className="w-2 h-2" />
                          {n.tag}
                        </span>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-display text-[12px] font-bold leading-snug text-foreground">
                        {n.title}
                      </h3>
                      <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
                        {n.description}
                      </p>
                      {n.href && (
                        <Link
                          href={n.href}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
                        >
                          <BookOpen className="w-2.5 h-2.5" />
                          {n.hrefLabel}
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

      {/* ── Mobile: vertical premium minimal timeline ── */}
      <div className="md:hidden px-4">
        <div className="relative pl-7">
          {/* Vertical dotted axis */}
          <div
            aria-hidden="true"
            className="absolute left-[9px] top-0 bottom-0 w-px"
            style={{
              background: "repeating-linear-gradient(to bottom, rgba(13,33,161,0.2) 0, rgba(13,33,161,0.2) 4px, transparent 4px, transparent 8px)",
            }}
          />

          <div className="space-y-1">
            {nodes.map((n, i) => {
              const Icon = n.icon;
              const isOpen = openSet.has(i);

              return (
                <div key={n.title} className="relative">
                  {/* Dot */}
                  <button
                    data-tl-dot
                    onMouseEnter={() => show(i)}
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-label={`${n.title} — ${n.year}`}
                    className="absolute -left-7 top-2.5 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                  >
                    <span
                      className={`block h-3 w-3 rounded-full border-2 border-brand transition-all duration-300 ${
                        isOpen
                          ? "bg-brand scale-125 shadow-[0_0_0_5px_rgba(13,33,161,0.1)]"
                          : "bg-background"
                      }`}
                    />
                  </button>

                  {/* Always-visible row */}
                  <button
                    onClick={() => toggle(i)}
                    onMouseEnter={() => show(i)}
                    className="w-full text-left py-2.5 rounded-lg transition-colors duration-200 hover:bg-brand/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand tabular-nums">
                        {n.year}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-brand/30" />
                      <span
                        className={`text-sm font-semibold transition-colors duration-200 ${
                          isOpen ? "text-brand" : "text-foreground"
                        }`}
                      >
                        {n.title}
                      </span>
                    </div>
                    <span className="block text-[11px] text-muted-foreground/60 mt-0.5 pl-0">
                      {n.oneLiner}
                    </span>
                  </button>

                  {/* Expandable card */}
                  <div
                    className="overflow-hidden transition-all duration-400 ease-out"
                    style={{
                      maxHeight: isOpen ? "300px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="pb-4 pt-1">
                      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden ml-1">
                        {n.image && (
                          <div className="relative h-28 w-full overflow-hidden">
                            <Image
                              src={n.image}
                              alt={n.title}
                              fill
                              sizes="100vw"
                              className="object-cover object-right-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/40 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                              <Icon className="w-2 h-2" />
                              {n.tag}
                            </span>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {n.description}
                          </p>
                          {n.href && (
                            <Link
                              href={n.href}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              {n.hrefLabel}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
