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
    oneLiner: "Where it all started",
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

/* ── Geometry ── */
const TRACK_W = 1200;
const WAVE_CY = 220; /* wave center Y */
const WAVE_AMP = 60; /* wave amplitude */
/* Dot Y on wave: alternate above/below center */
const dotY = (i: number) => WAVE_CY + (i % 2 === 0 ? -WAVE_AMP : WAVE_AMP);
/* Card position: above or below the dot */
const CARD_ABOVE = true; /* above-wave dots get cards above */
const cardTop = (i: number) => {
  const above = i % 2 === 0;
  return above ? dotY(i) - 20 - 190 : dotY(i) + 20; /* 190 = card height approx */
};
const TRACK_H = 460; /* total height: enough for above + below cards */
const CARD_W = 280;

/* ── Wave path ── */
function buildWave(): string {
  const pts = nodes.map((_, i) => ({
    x: (i / (nodes.length - 1)) * TRACK_W,
    y: dotY(i),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cx = prev.x + (curr.x - prev.x) * 0.5;
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [pinnedCard, setPinnedCard] = useState<number | null>(null);
  const [flipping, setFlipping] = useState<number | null>(null);

  const displayCard = pinnedCard ?? activeCard;

  const hoverIn = useCallback((i: number) => setActiveCard(i), []);
  const hoverOut = useCallback(() => setActiveCard(null), []);

  const handleClick = useCallback((i: number) => {
    setPinnedCard((prev) => {
      const next = prev === i ? null : i;
      if (next !== null) {
        setActiveCard(next);
        setFlipping(next);
        setTimeout(() => setFlipping(null), 500);
      } else {
        setActiveCard(null);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setPinnedCard(null); setActiveCard(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* GSAP */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo("[data-tl-head]",
        { opacity: 0, y: 30, filter: "blur(3px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" } }
      );
      gsap.fromTo("[data-tl-track]",
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play reverse play reset" } }
      );
      gsap.fromTo("[data-tl-dot]",
        { scale: 0 },
        { scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(2.5)", delay: 0.3,
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play reverse play reset" } }
      );
      gsap.fromTo("[data-tl-wave]",
        { strokeDashoffset: 2000 },
        { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: 0.1,
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play reverse play reset" } }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const wavePath = buildWave();
  const dotX = (i: number) => (i / (nodes.length - 1)) * TRACK_W;
  const cardNode = displayCard !== null ? nodes[displayCard] : null;
  const CardIcon = cardNode?.icon;

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-20 border-b border-border bg-background overflow-hidden"
      aria-label="Journey timeline"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 md:mb-10">
        <div className="text-center" data-tl-head>
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

      {/* ── Horizontal scrollable track ── */}
      <div
        data-tl-track
        className="overflow-x-auto scrollbar-hide px-4 sm:px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: `${TRACK_W}px`, height: `${TRACK_H}px`, minWidth: "700px" }}
        >
          {/* SVG: wave + dots */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={TRACK_W}
            height={TRACK_H}
            viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
            fill="none"
          >
            {/* Background wave track */}
            <path d={wavePath} stroke="rgba(13,33,161,0.06)" strokeWidth="8" strokeLinecap="round" fill="none" />
            {/* Animated draw wave */}
            <path data-tl-wave d={wavePath} stroke="rgba(13,33,161,0.2)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="2000" strokeDashoffset="2000" />
            {/* Dotted wave overlay */}
            <path d={wavePath} stroke="rgba(13,33,161,0.35)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4 8" className="animate-wave-dots" />
            {/* Progress line */}
            {displayCard !== null && (() => {
              const pts = nodes.map((_, i) => ({ x: dotX(i), y: dotY(i) }));
              let d = `M ${pts[0].x} ${pts[0].y}`;
              for (let j = 1; j <= displayCard; j++) {
                const prev = pts[j - 1], curr = pts[j];
                const cx = prev.x + (curr.x - prev.x) * 0.5;
                d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
              }
              return <path d={d} stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" fill="none" style={{ transition: "all 0.4s ease-out" }} />;
            })()}
            {/* SVG dots on the wave */}
            {nodes.map((n, i) => {
              const x = dotX(i);
              const y = dotY(i);
              const isOpen = displayCard === i;
              return (
                <g key={n.title}>
                  {/* Dot outer glow when active */}
                  {isOpen && <circle cx={x} cy={y} r="14" fill="rgba(13,33,161,0.08)" />}
                  {/* Dot */}
                  <circle
                    data-tl-dot
                    cx={x}
                    cy={y}
                    r={isOpen ? "8" : "6"}
                    fill={isOpen ? "var(--brand)" : "var(--background)"}
                    stroke="var(--brand)"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer", transition: "all 0.3s ease-out", filter: isOpen ? "drop-shadow(0 0 6px rgba(13,33,161,0.3))" : "none" }}
                    onMouseEnter={() => hoverIn(i)}
                    onMouseLeave={hoverOut}
                    onClick={() => handleClick(i)}
                    className="pointer-events-auto"
                    role="button"
                    aria-label={`${n.title} — ${n.year}`}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(i); }}
                  />
                  {/* Year label */}
                  <text
                    x={x}
                    y={i % 2 === 0 ? y - 16 : y + 22}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", transition: "fill 0.3s ease-out", ...(isOpen ? { fill: "var(--brand)" } : {}) }}
                  >
                    {n.year}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Connectors: dotted lines from dot to card */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const y = dotY(i);
            const above = i % 2 === 0;
            const isOpen = displayCard === i;
            const cardY = cardTop(i);
            /* Connector: from dot edge to card edge */
            const connTop = above ? cardY + 190 : y + 10;
            const connBottom = above ? y - 10 : cardY;
            const connH = Math.max(0, connBottom - connTop);

            return (
              <div
                key={`conn-${n.title}`}
                aria-hidden="true"
                className="absolute w-px"
                style={{
                  left: `${x}px`,
                  top: `${connTop}px`,
                  height: `${connH}px`,
                  transform: "translateX(-50%)",
                  background: isOpen
                    ? "repeating-linear-gradient(to bottom, var(--brand) 0, var(--brand) 3px, transparent 3px, transparent 7px)"
                    : "repeating-linear-gradient(to bottom, rgba(13,33,161,0.1) 0, rgba(13,33,161,0.1) 3px, transparent 3px, transparent 7px)",
                  transition: "background 0.3s ease-out",
                }}
              />
            );
          })}

          {/* Cards — positioned at dot's X, above or below */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const isOpen = displayCard === i;
            const Icon = n.icon;
            const above = i % 2 === 0;

            return (
              <div
                key={`card-${n.title}`}
                className="absolute"
                style={{
                  left: `${x - CARD_W / 2}px`,
                  top: `${cardTop(i)}px`,
                  width: `${CARD_W}px`,
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? "auto" : "none",
                  transition: "opacity 0.3s ease-out",
                  zIndex: isOpen ? 30 : 1,
                }}
              >
                <div
                  className="rounded-2xl border border-border bg-card shadow-xl"
                  style={{
                    perspective: "800px",
                    transformStyle: "preserve-3d",
                    animation: isOpen && flipping === i ? "tlFlip 0.5s ease-out" : isOpen ? "tlFadeIn 0.3s ease-out" : "none",
                  }}
                >
                  {/* Accent connector nub at card edge */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-brand transition-all duration-300"
                    style={{
                      width: isOpen ? "36px" : "0px",
                      ...(above ? { bottom: "-1px" } : { top: "-1px" }),
                    }}
                  />

                  {n.image && (
                    <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ aspectRatio: "16/9" }}>
                      <Image
                        src={n.image}
                        alt={n.title}
                        fill
                        sizes={`${CARD_W}px`}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/40 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                        <Icon className="w-2.5 h-2.5" />
                        {n.tag}
                      </span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-brand/60 uppercase tracking-wider">{n.year}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-brand/30" />
                      <span className="text-[9px] font-semibold text-accent-strong uppercase tracking-wider">{n.oneLiner}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug">{n.title}</h3>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{n.description}</p>
                    {n.href && (
                      <Link href={n.href} className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline">
                        <BookOpen className="w-2.5 h-2.5" />{n.hrefLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tlFlip {
          0%   { opacity:0; transform: rotateY(-90deg) scale(0.92); }
          60%  { opacity:1; transform: rotateY(6deg) scale(1.01); }
          80%  { transform: rotateY(-2deg) scale(0.995); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        @keyframes tlFadeIn {
          0%   { opacity:0; transform: translateY(6px); }
          100% { opacity:1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
}
