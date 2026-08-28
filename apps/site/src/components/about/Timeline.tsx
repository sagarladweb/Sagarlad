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
      "Growing up in Gujarat, I fell in love with computers. Late nights, broken code, and a stubborn belief that tech could change everything — that belief never left.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
  },
  {
    year: "2009 – 2013",
    title: "Engineering College",
    oneLiner: "Four years of building",
    description:
      "BVM College was where theory met reality. I spent more time in the lab than the classroom — and those habits shaped the engineer I became.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: " Joined TCS",
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
      "IIIT Bangalore changed how I see problems. Statistics, ML, and a whole new toolkit for solving real-world challenges with data.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books",
    oneLiner: "Words that outlive me",
    description:
      "Finance, AI, habits, growth — each book came from a place of wanting to help. Not theory from a desk, but lessons from the field.",
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

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

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

  // GSAP animations
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Heading
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

      // Entire track slides in from right
      gsap.fromTo(
        "[data-tl-track]",
        { opacity: 0, x: 150 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 75%" },
          onComplete: () => {
            setActive(0);
          },
        }
      );

      // Dots pop in with stagger
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

      // Axis line draws
      gsap.fromTo(
        "[data-tl-line]",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.15,
          scrollTrigger: { trigger: el, start: "top 75%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 border-b border-border bg-background"
      aria-label="Journey timeline"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 md:mb-14">
        <div className="text-center" data-tl-heading>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand border border-brand/20 rounded-full px-4 py-1.5 bg-transparent">
            Where it started
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            The story, in dates
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Tap any dot to read the chapter behind it.
          </p>
        </div>
      </div>

      {/* ── Desktop: horizontal static layout ── */}
      <div
        ref={trackRef}
        data-tl-track
        className="hidden md:block max-w-6xl mx-auto px-6"
      >
        <div className="relative" style={{ height: "440px" }}>
          {/* Axis line */}
          <div
            aria-hidden="true"
            data-tl-line
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent origin-left"
            style={{ top: "50%" }}
          />

          {/* Nodes */}
          <div className="absolute inset-0 flex justify-between">
            {nodes.map((n, i) => {
              const Icon = n.icon;
              const above = i % 2 === 0;
              const isOpen = active === i;

              return (
                <div
                  key={n.title}
                  className="relative flex flex-col items-center"
                  style={{ width: "130px" }}
                >
                  {/* Year + one-liner */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
                    style={{
                      top: above ? "calc(50% - 140px)" : "calc(50% + 20px)",
                    }}
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isOpen ? "text-brand" : "text-muted-foreground"
                      }`}
                    >
                      {n.year}
                    </span>
                    <span
                      className={`block mt-0.5 text-[11px] font-medium leading-tight max-w-[120px] mx-auto transition-colors duration-300 ${
                        isOpen ? "text-foreground" : "text-muted-foreground/60"
                      }`}
                    >
                      {n.oneLiner}
                    </span>
                  </div>

                  {/* Connector line */}
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-px w-px transition-all duration-300"
                    style={{
                      height: isOpen ? "48px" : "24px",
                      top: above ? "calc(50% - 48px)" : "calc(50%)",
                      background: isOpen
                        ? "var(--brand)"
                        : "rgba(13,33,161,0.12)",
                    }}
                  />

                  {/* Dot */}
                  <button
                    data-tl-dot
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-label={`${n.title} — ${n.year}`}
                    className="absolute left-1/2 -translate-x-1/2 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-full"
                    style={{ top: "calc(50% - 8px)" }}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full border-[2.5px] border-brand transition-all duration-300 ${
                        isOpen
                          ? "bg-brand scale-150 shadow-[0_0_0_8px_rgba(13,33,161,0.12)]"
                          : "bg-background hover:scale-125 hover:shadow-[0_0_0_6px_rgba(13,33,161,0.08)]"
                      }`}
                    />
                  </button>

                  {/* Card */}
                  <div
                    data-tl-card
                    className="absolute left-1/2 z-30"
                    style={{
                      top: above ? undefined : "calc(50% + 72px)",
                      bottom: above ? "calc(50% + 72px)" : undefined,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "220px",
                      opacity: isOpen ? 1 : 0,
                      pointerEvents: isOpen ? "auto" : "none",
                      transition:
                        "opacity 0.35s ease-out, transform 0.35s ease-out",
                    }}
                  >
                    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                      {n.image && (
                        <div className="relative h-28 w-full overflow-hidden">
                          <Image
                            src={n.image}
                            alt={n.title}
                            fill
                            sizes="220px"
                            className="object-cover object-right-top sm:object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/40 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                            <Icon className="w-2.5 h-2.5" />
                            {n.tag}
                          </span>
                        </div>
                      )}
                      <div className="p-3.5">
                        <h3 className="font-display text-[13px] font-bold leading-snug text-foreground">
                          {n.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                          {n.description}
                        </p>
                        {n.href && (
                          <Link
                            href={n.href}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                          >
                            <BookOpen className="w-3 h-3" />
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
      </div>

      {/* ── Mobile: vertical timeline ── */}
      <div className="md:hidden px-5">
        <div className="relative pl-8">
          {/* Vertical axis */}
          <div
            aria-hidden="true"
            className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-brand/30 via-brand/15 to-transparent"
          />

          <div className="space-y-6">
            {nodes.map((n, i) => {
              const Icon = n.icon;
              const isOpen = active === i;

              return (
                <div key={n.title} className="relative">
                  {/* Dot */}
                  <button
                    data-tl-dot
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-label={`${n.title} — ${n.year}`}
                    className="absolute -left-8 top-3 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                  >
                    <span
                      className={`block h-3.5 w-3.5 rounded-full border-2 border-brand transition-all duration-300 ${
                        isOpen
                          ? "bg-brand scale-125 shadow-[0_0_0_6px_rgba(13,33,161,0.12)]"
                          : "bg-background"
                      }`}
                    />
                  </button>

                  {/* Year */}
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors duration-300 ${
                      isOpen ? "text-brand" : "text-muted-foreground/60"
                    }`}
                  >
                    {n.year}
                  </span>

                  {/* Always-visible teaser */}
                  <button
                    onClick={() => toggle(i)}
                    className="w-full text-left"
                  >
                    <span
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isOpen ? "text-brand" : "text-foreground"
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="block text-xs text-muted-foreground/60 mt-0.5">
                      {n.oneLiner}
                    </span>
                  </button>

                  {/* Card */}
                  <div
                    data-tl-card
                    className="mt-2 overflow-hidden"
                    style={{
                      maxHeight: isOpen ? "400px" : "0px",
                      opacity: isOpen ? 1 : 0,
                      transition:
                        "max-height 0.4s ease-out, opacity 0.3s ease-out",
                    }}
                  >
                    <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden">
                      {n.image && (
                        <div className="relative h-32 w-full overflow-hidden">
                          <Image
                            src={n.image}
                            alt={n.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 220px"
                            className="object-cover object-right-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/40 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                            <Icon className="w-2.5 h-2.5" />
                            {n.tag}
                          </span>
                        </div>
                      )}
                      <div className="p-3.5">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {n.description}
                        </p>
                        {n.href && (
                          <Link
                            href={n.href}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                          >
                            <BookOpen className="w-3 h-3" />
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
      </div>
    </section>
  );
}
