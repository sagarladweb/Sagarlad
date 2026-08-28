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
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [flipping, setFlipping] = useState<number | null>(null);

  /* Desktop: hover shows card temporarily */
  const hoverIn = useCallback((i: number) => {
    setActiveCard(i);
  }, []);

  const hoverOut = useCallback(() => {
    setActiveCard(null);
  }, []);

  /* Click/tap: toggle persistent card (overrides hover) */
  const [pinnedCard, setPinnedCard] = useState<number | null>(null);

  const handleClick = useCallback((i: number) => {
    setPinnedCard((prev) => {
      const next = prev === i ? null : i;
      if (next !== null) setActiveCard(next);
      else setActiveCard(null);
      // Trigger flip animation
      if (next !== null) {
        setFlipping(next);
        setTimeout(() => setFlipping(null), 500);
      }
      return next;
    });
  }, []);

  const displayCard = pinnedCard ?? activeCard;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinnedCard(null);
        setActiveCard(null);
      }
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
        "[data-tl-track]",
        { opacity: 0, x: 80 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 75%" },
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

      gsap.fromTo(
        "[data-tl-wave]",
        { strokeDashoffset: 2000 },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.inOut",
          delay: 0.1,
          scrollTrigger: { trigger: el, start: "top 75%" },
        }
      );

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
  const trackHeight = 160;
  const wavePath = buildWavePath(trackWidth, trackHeight);
  const cardNode = displayCard !== null ? nodes[displayCard] : null;
  const CardIcon = cardNode?.icon;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 border-b border-border bg-background"
      aria-label="Journey timeline"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 md:mb-12">
        <div className="text-center" data-tl-heading>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand border border-brand/20 rounded-full px-4 py-1.5 bg-transparent">
            Where it started
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Key moments along the way
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Hover or tap any dot to read the chapter behind it.
          </p>
        </div>
      </div>

      {/* ── Dots track (scrollable on all screens) ── */}
      <div
        data-tl-track
        className="overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: `${trackWidth}px`, height: `${trackHeight + 60}px`, minWidth: "700px" }}
        >
          {/* SVG wave axis */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={trackWidth}
            height={trackHeight}
            viewBox={`0 0 ${trackWidth} ${trackHeight}`}
            fill="none"
            style={{ top: "20px" }}
          >
            <path d={wavePath} stroke="rgba(13,33,161,0.06)" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path
              data-tl-wave
              d={wavePath}
              stroke="rgba(13,33,161,0.2)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="2000"
              strokeDashoffset="2000"
            />
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
            const x = (i / (nodes.length - 1)) * trackWidth;
            const y = (WAVE_Y[i] / 100) * trackHeight + 20;
            const above = WAVE_Y[i] < 50;
            const isOpen = displayCard === i;

            return (
              <div
                key={n.title}
                className="absolute"
                style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
              >
                {/* Connector line */}
                <div
                  data-tl-connector
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 w-px"
                  style={{
                    height: isOpen ? "52px" : "24px",
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
                  onMouseEnter={() => hoverIn(i)}
                  onMouseLeave={hoverOut}
                  onClick={() => handleClick(i)}
                  aria-expanded={isOpen}
                  aria-label={`${n.title} — ${n.year}`}
                  className="relative z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-full cursor-pointer"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Card area (centered, no inner scroll, flip animation) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div
          className="relative mx-auto"
          style={{
            maxWidth: "380px",
            minHeight: displayCard !== null ? "320px" : "0px",
            transition: "min-height 0.3s ease-out",
          }}
        >
          {cardNode && (
            <div
              key={displayCard}
              className="rounded-2xl border border-border bg-card shadow-xl overflow-visible"
              style={{
                perspective: "800px",
                transformStyle: "preserve-3d",
                animation: flipping === displayCard ? "cardFlip 0.5s ease-out" : "cardFadeIn 0.3s ease-out",
              }}
            >
              {cardNode.image && (
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                  <Image
                    src={cardNode.image}
                    alt={cardNode.title}
                    fill
                    sizes="380px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 border border-white/40 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                    {CardIcon && <CardIcon className="w-3 h-3" />}
                    {cardNode.tag}
                  </span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-brand/60 uppercase tracking-wider">{cardNode.year}</span>
                  <span className="w-1 h-1 rounded-full bg-brand/30" />
                  <span className="text-[10px] font-semibold text-accent-strong uppercase tracking-wider">{cardNode.oneLiner}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{cardNode.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{cardNode.description}</p>
                {cardNode.href && (
                  <Link
                    href={cardNode.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    <BookOpen className="w-3 h-3" />
                    {cardNode.hrefLabel}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flip + fade-in keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardFlip {
          0% { opacity: 0; transform: rotateY(-90deg) scale(0.9); }
          60% { opacity: 1; transform: rotateY(8deg) scale(1.02); }
          80% { transform: rotateY(-3deg) scale(0.99); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        @keyframes cardFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
}
