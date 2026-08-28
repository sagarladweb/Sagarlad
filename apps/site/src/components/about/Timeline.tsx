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
  word: string;
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
    word: "Foundation",
    description:
      "Growing up in Gujarat, I fell in love with computers. Late nights, broken code, and a stubborn belief that tech could change everything.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
  },
  {
    year: "2009 – 2013",
    title: "Engineering",
    word: "Growth",
    description:
      "BVM College was where theory met reality. More time in the lab than the classroom — and those habits shaped the engineer I became.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: "Joined TCS",
    word: "Launch",
    description:
      "From a small town in Gujarat to boardrooms in Europe. TCS gave me the world — and I made the most of every opportunity.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
  },
  {
    year: "2019 – 2020",
    title: "Data Science",
    word: "Pivot",
    description:
      "IIIT Bangalore changed how I see problems. Statistics, ML, and a whole new toolkit for solving real-world challenges.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books",
    word: "Legacy",
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
    title: "Gen AI",
    word: "Mastery",
    description:
      "Purdue University — diving deep into AI systems that are responsible, practical, and built for the real world.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/speaking/candid-presentation.webp",
  },
  {
    year: "2026",
    title: "TEDx Speaker",
    word: "Peak",
    description:
      "Taking the TEDx stage to share what years of hands-on experience taught me about AI and decision-making.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
  },
];

/* ── Geometry ── */
const TRACK_W = 1200;
const TRACK_H = 640;
const PAD = 110;
const WAVE_AMP = 60;
const CARD_W = 260;
const CARD_IMG_H = 80;
const CARD_TEXT_H = 110;
const CARD_H = CARD_IMG_H + CARD_TEXT_H;

/* Wave center: drifts upward from left → right */
const WAVE_CY_L = 230;
const WAVE_CY_R = 150;
const waveCenter = (i: number) => WAVE_CY_L + (i / (nodes.length - 1)) * (WAVE_CY_R - WAVE_CY_L);

/* Dot placement: organic, overall upward trend.
   0↓ 1↑ 2↓ 3↑ 4↑ 5↓ 6↑ */
const dotAbove = [false, true, false, true, true, false, true];

const dotX = (i: number) => PAD + (i / (nodes.length - 1)) * (TRACK_W - PAD * 2);
const dotY = (i: number) => waveCenter(i) + (dotAbove[i] ? -WAVE_AMP : WAVE_AMP);

/* Cards always below their dot */
const CARD_GAP = 18;
const cardTop = (i: number) => dotY(i) + CARD_GAP;

/* ── Smooth cubic bezier wave path ── */
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

/* ── Progress curve (solid brand line) ── */
function buildProgress(upTo: number): string {
  const pts = nodes.map((_, i) => ({ x: dotX(i), y: dotY(i) }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let j = 1; j <= upTo; j++) {
    const p = pts[j - 1];
    const c = pts[j];
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
        { opacity: 0, x: 80 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play reverse play reset" } }
      );
      gsap.fromTo("[data-tl-dot]",
        { scale: 0 },
        { scale: 1, duration: 0.35, stagger: 0.07, ease: "back.out(3)", delay: 0.3,
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play reverse play reset" } }
      );
      gsap.fromTo("[data-tl-wave]",
        { strokeDashoffset: 2000 },
        { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", delay: 0.1,
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play reverse play reset" } }
      );
      /* Active card pop */
      gsap.fromTo("[data-tl-card]",
        { scale: 0.95, boxShadow: "0 0 0 rgba(0,0,0,0)" },
        { scale: 1, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", duration: 0.35, ease: "back.out(2)", stagger: 0.06,
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
        className="overflow-x-auto overflow-y-hidden scrollbar-hide px-4 sm:px-6 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: `${TRACK_W}px`, height: `${TRACK_H}px`, minWidth: "680px" }}
        >
          {/* ── SVG wave lines ── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={TRACK_W}
            height={TRACK_H}
            viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
            fill="none"
          >
            <path d={wavePath} stroke="rgba(13,33,161,0.04)" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path data-tl-wave d={wavePath} stroke="rgba(13,33,161,0.15)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="2000" strokeDashoffset="2000" />
            <path d={wavePath} stroke="rgba(13,33,161,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="4 8" className="animate-wave-dots" />
            {displayCard !== null && (
              <path d={buildProgress(displayCard)} stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ transition: "all 0.4s ease-out" }} />
            )}
          </svg>

          {/* ── Dot buttons ── */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const y = dotY(i);
            const isOpen = displayCard === i;
            const isTop = dotAbove[i];

            return (
              <div
                key={`dot-${n.title}`}
                style={{ position: "absolute", left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)", zIndex: 20 }}
              >
                {/* Pulse ring */}
                {isOpen && (
                  <div
                    className="absolute rounded-full bg-brand/10 pointer-events-none"
                    style={{
                      width: 40, height: 40, left: -20, top: -20,
                      animation: "tlPulse 2s ease-in-out infinite",
                    }}
                  />
                )}

                {/* Dot button — large hit area */}
                <button
                  data-tl-dot
                  onMouseEnter={() => hoverIn(i)}
                  onMouseLeave={hoverOut}
                  onClick={() => handleClick(i)}
                  className="relative block rounded-full border-[2.5px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  style={{
                    width: isOpen ? 22 : 16,
                    height: isOpen ? 22 : 16,
                    backgroundColor: isOpen ? "var(--brand)" : "var(--background)",
                    borderColor: "var(--brand)",
                    boxShadow: isOpen
                      ? "0 0 10px rgba(13,33,161,0.3)"
                      : "0 1px 4px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                  }}
                  aria-label={`${n.title} — ${n.year}`}
                />

                {/* Word label — opposite side of dot from card (above for below-dots, below for above-dots) */}
                <span
                  className="absolute whitespace-nowrap pointer-events-none"
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: isOpen ? "var(--brand)" : "hsl(var(--muted-foreground))",
                    transition: "color 0.3s ease-out",
                    left: "50%",
                    transform: "translateX(-50%)",
                    ...(isTop
                      ? { top: "auto", bottom: -26 }
                      : { bottom: "auto", top: -26 }),
                  }}
                >
                  {n.word}
                </span>
              </div>
            );
          })}

          {/* ── Connector lines: dot → card ── */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const dy = dotY(i);
            const ct = cardTop(i);
            const isOpen = displayCard === i;

            /* Dot bottom edge → card top edge */
            const connTop = dy + 9;
            const connBottom = ct;
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
                    : "repeating-linear-gradient(to bottom, rgba(13,33,161,0.1) 0, rgba(13,33,161,0.1) 3px, transparent 3px, transparent 7px)",
                  transition: "background 0.3s ease-out",
                }}
              />
            );
          })}

          {/* ── Cards ── */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const isOpen = displayCard === i;
            const Icon = n.icon;

            return (
              <div
                key={`card-${n.title}`}
                data-tl-card
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
                  className="rounded-xl border border-border bg-card shadow-lg overflow-hidden"
                  style={{
                    perspective: "800px",
                    transformStyle: "preserve-3d",
                    animation: isOpen && flipping === i ? "tlFlip 0.5s ease-out" : isOpen ? "tlFadeIn 0.3s ease-out" : "none",
                  }}
                >
                  {/* Accent nub */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-brand transition-all duration-300"
                    style={{ width: isOpen ? "32px" : "0px", top: "-1px" }}
                  />

                  {/* Image */}
                  {n.image && (
                    <div className="relative w-full" style={{ height: `${CARD_IMG_H}px` }}>
                      <Image
                        src={n.image}
                        alt={n.title}
                        fill
                        sizes={`${CARD_W}px`}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 border border-white/35 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                        <Icon className="w-2.5 h-2.5" />
                        {n.tag}
                      </span>
                    </div>
                  )}

                  {/* Text */}
                  <div className="p-3" style={{ height: `${CARD_TEXT_H}px` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-brand/60 uppercase tracking-wider">{n.year}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-brand/30" />
                      <span className="text-[9px] font-semibold text-accent-strong uppercase tracking-wider">{n.word}</span>
                    </div>
                    <h3 className="font-display text-[13px] font-bold text-foreground leading-snug">{n.title}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{n.description}</p>
                    {n.href && (
                      <Link href={n.href} className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline">
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
          50%      { opacity: 0.15; transform: scale(1.4); }
        }
      `}} />
    </section>
  );
}
