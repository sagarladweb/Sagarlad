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
const TRACK_H = 500;
const PAD = 100; /* side padding so first/last dots aren't at edges */
const WAVE_CY = 250;
const WAVE_AMP = 70;
const CARD_W = 270;
const CARD_H = 240; /* image 100 + text 100 + paddings ~40 */
const CARD_GAP = 28; /* gap between dot and card edge */
const CARD_ABOVE_Y = 12; /* top of above-wave cards */
const CARD_BELOW_Y = WAVE_CY + WAVE_AMP + CARD_GAP; /* top of below-wave cards */
const DOT_R = 6;

/* Organic wave pattern: not perfectly alternating.
   0=up 1=down 2=up 3=up 4=down 5=down 6=up */
const above = [true, false, true, true, false, false, true];
const dotY = (i: number) => (above[i] ? WAVE_CY - WAVE_AMP : WAVE_CY + WAVE_AMP);
const cardTop = (i: number) => (above[i] ? CARD_ABOVE_Y : CARD_BELOW_Y);
const dotX = (i: number) => PAD + (i / (nodes.length - 1)) * (TRACK_W - PAD * 2);

/* ── Smooth wave path through all dots ── */
function buildWave(): string {
  const pts = nodes.map((_, i) => ({ x: dotX(i), y: dotY(i) }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const cx1 = p.x + (c.x - p.x) * 0.4;
    const cx2 = p.x + (c.x - p.x) * 0.6;
    d += ` C ${cx1} ${p.y}, ${cx2} ${c.y}, ${c.x} ${c.y}`;
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

      {/* ── Scrollable track — horizontal only ── */}
      <div
        data-tl-track
        className="overflow-x-auto overflow-y-hidden scrollbar-hide px-4 sm:px-6 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: `${TRACK_W}px`, height: `${TRACK_H}px`, minWidth: "700px" }}
        >
          {/* ── SVG: wave lines only ── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={TRACK_W}
            height={TRACK_H}
            viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
            fill="none"
          >
            {/* Wave background glow */}
            <path d={wavePath} stroke="rgba(13,33,161,0.04)" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Wave draw animation */}
            <path data-tl-wave d={wavePath} stroke="rgba(13,33,161,0.15)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="2000" strokeDashoffset="2000" />
            {/* Wave dotted overlay */}
            <path d={wavePath} stroke="rgba(13,33,161,0.25)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="4 8" className="animate-wave-dots" />
            {/* Progress line (solid brand) */}
            {displayCard !== null && (() => {
              const pts = nodes.map((_, i) => ({ x: dotX(i), y: dotY(i) }));
              let d = `M ${pts[0].x} ${pts[0].y}`;
              for (let j = 1; j <= displayCard; j++) {
                const p = pts[j - 1], c = pts[j];
                const cx1 = p.x + (c.x - p.x) * 0.4;
                const cx2 = p.x + (c.x - p.x) * 0.6;
                d += ` C ${cx1} ${p.y}, ${cx2} ${c.y}, ${c.x} ${c.y}`;
              }
              return <path d={d} stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ transition: "all 0.4s ease-out" }} />;
            })()}
          </svg>

          {/* ── HTML dot buttons (better hover than SVG circles) ── */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const y = dotY(i);
            const isOpen = displayCard === i;
            const isAbove = above[i];
            return (
              <div key={`dot-${n.title}`} style={{ position: "absolute", left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)", zIndex: 20 }}>
                {/* Outer ring (active) */}
                {isOpen && (
                  <div
                    className="absolute inset-0 rounded-full bg-brand/8"
                    style={{ width: DOT_R * 5, height: DOT_R * 5, left: -(DOT_R * 2), top: -(DOT_R * 2), animation: "tlPulse 2s ease-in-out infinite" }}
                  />
                )}
                {/* Button */}
                <button
                  data-tl-dot
                  onMouseEnter={() => hoverIn(i)}
                  onMouseLeave={hoverOut}
                  onClick={() => handleClick(i)}
                  className="relative block rounded-full border-[2.5px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  style={{
                    width: isOpen ? DOT_R * 2.8 : DOT_R * 2,
                    height: isOpen ? DOT_R * 2.8 : DOT_R * 2,
                    backgroundColor: isOpen ? "var(--brand)" : "var(--background)",
                    borderColor: "var(--brand)",
                    boxShadow: isOpen ? "0 0 8px rgba(13,33,161,0.25)" : "0 1px 3px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                  }}
                  aria-label={`${n.title} — ${n.year}`}
                />
                {/* Year label — positioned on opposite side of card */}
                <span
                  className="absolute whitespace-nowrap transition-colors duration-300"
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: isOpen ? "var(--brand)" : "hsl(var(--muted-foreground))",
                    left: "50%",
                    transform: "translateX(-50%)",
                    ...(isAbove ? { top: DOT_R * 2 + 8 } : { bottom: DOT_R * 2 + 8 }),
                  }}
                >
                  {n.year}
                </span>
              </div>
            );
          })}

          {/* ── Connectors: vertical dotted lines from dot to card ── */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const dy = dotY(i);
            const isAbove = above[i];
            const isOpen = displayCard === i;
            const ct = cardTop(i);

            /* Connector spans from card edge to dot edge */
            let connTop: number;
            let connBottom: number;
            if (isAbove) {
              /* Card is above dot: connector from card bottom → dot top */
              connTop = ct + CARD_H;
              connBottom = dy - DOT_R - 2;
            } else {
              /* Card is below dot: connector from dot bottom → card top */
              connTop = dy + DOT_R + 2;
              connBottom = ct;
            }
            const connH = Math.max(0, connBottom - connTop);

            return (
              <div
                key={`conn-${n.title}`}
                aria-hidden="true"
                className="absolute"
                style={{
                  left: `${x}px`,
                  top: `${connTop}px`,
                  width: "1px",
                  height: `${connH}px`,
                  transform: "translateX(-50%)",
                  background: isOpen
                    ? "repeating-linear-gradient(to bottom, var(--brand) 0, var(--brand) 3px, transparent 3px, transparent 7px)"
                    : "repeating-linear-gradient(to bottom, rgba(13,33,161,0.12) 0, rgba(13,33,161,0.12) 3px, transparent 3px, transparent 7px)",
                  transition: "background 0.3s ease-out",
                }}
              />
            );
          })}

          {/* ── Cards ── */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const isAbove = above[i];
            const isOpen = displayCard === i;
            const Icon = n.icon;

            return (
              <div
                key={`card-${n.title}`}
                className="absolute"
                style={{
                  left: `${x - CARD_W / 2}px`,
                  top: `${cardTop(i)}px`,
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? "auto" : "none",
                  transition: "opacity 0.3s ease-out",
                  zIndex: isOpen ? 30 : 1,
                }}
              >
                <div
                  className="h-full rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col"
                  style={{
                    perspective: "800px",
                    transformStyle: "preserve-3d",
                    animation: isOpen && flipping === i ? "tlFlip 0.5s ease-out" : isOpen ? "tlFadeIn 0.3s ease-out" : "none",
                  }}
                >
                  {/* Accent nub at card edge facing the dot */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-brand transition-all duration-300"
                    style={{
                      width: isOpen ? "32px" : "0px",
                      ...(isAbove ? { bottom: "-1px" } : { top: "-1px" }),
                    }}
                  />

                  {/* Image */}
                  {n.image && (
                    <div className="relative w-full shrink-0" style={{ height: "100px" }}>
                      <Image
                        src={n.image}
                        alt={n.title}
                        fill
                        sizes={`${CARD_W}px`}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/35 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                        <Icon className="w-2.5 h-2.5" />
                        {n.tag}
                      </span>
                    </div>
                  )}

                  {/* Text */}
                  <div className="flex-1 p-2.5 flex flex-col min-h-0">
                    <h3 className="font-display text-[13px] font-bold text-foreground leading-snug">{n.title}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-3 flex-1">{n.description}</p>
                    {n.href && (
                      <Link href={n.href} className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline shrink-0">
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
          0%   { opacity:0; transform: rotateY(-90deg) scale(0.95); }
          60%  { opacity:1; transform: rotateY(5deg) scale(1.01); }
          80%  { transform: rotateY(-2deg) scale(0.995); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        @keyframes tlFadeIn {
          0%   { opacity:0; transform: translateY(6px); }
          100% { opacity:1; transform: translateY(0); }
        }
        @keyframes tlPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.2; transform: scale(1.3); }
        }
      `}} />
    </section>
  );
}
