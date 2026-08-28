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

/* Wave: alternate above/below center */
const WAVE_Y = [40, 60, 40, 60, 40, 60, 40];

const TRACK_W = 1100;
const TRACK_H = 140;
const CARD_W = 300;
const DOT_Y = TRACK_H / 2; /* dot vertical center = 70px */
const CONN_H = 30; /* connector height: dot → card */
const CARD_TOP = DOT_Y + 10 + CONN_H; /* card starts below dot (10 = half dot) */
const TRACK_TOTAL_H = CARD_TOP + 210; /* full scroll container height */

function buildWavePath(): string {
  const pts = nodes.map((_, i) => ({
    x: (i / (nodes.length - 1)) * TRACK_W,
    y: (WAVE_Y[i] / 100) * TRACK_H,
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
  const trackRef = useRef<HTMLDivElement>(null);
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
      if (e.key === "Escape") {
        setPinnedCard(null);
        setActiveCard(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* GSAP animations */
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
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play reverse play reset",
          },
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
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play reverse play reset",
          },
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
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play reverse play reset",
          },
        }
      );

      gsap.fromTo(
        "[data-tl-conn]",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.5,
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play reverse play reset",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const wavePath = buildWavePath();
  const cardNode = displayCard !== null ? nodes[displayCard] : null;
  const CardIcon = cardNode?.icon;

  /* Dot X positions */
  const dotX = (i: number) => (i / (nodes.length - 1)) * TRACK_W;

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-20 border-b border-border bg-background"
      aria-label="Journey timeline"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 md:mb-10">
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

      {/* ── Single scrollable track: dots + connectors + cards ── */}
      <div
        ref={trackRef}
        data-tl-track
        className="overflow-x-auto scrollbar-hide px-4 sm:px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${TRACK_W}px`,
            height: `${TRACK_TOTAL_H}px`,
            minWidth: "700px",
          }}
        >
          {/* SVG wave axis */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={TRACK_W}
            height={TRACK_H}
            viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
            fill="none"
            style={{ top: 0 }}
          >
            <path
              d={wavePath}
              stroke="rgba(13,33,161,0.06)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
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
            {/* Progress line up to active dot */}
            {displayCard !== null && (
              <path
                d={(() => {
                  const pts = nodes.map((_, i) => ({
                    x: dotX(i),
                    y: (WAVE_Y[i] / 100) * TRACK_H,
                  }));
                  let d = `M ${pts[0].x} ${pts[0].y}`;
                  for (let j = 1; j <= displayCard; j++) {
                    const prev = pts[j - 1];
                    const curr = pts[j];
                    const cx = prev.x + (curr.x - prev.x) * 0.5;
                    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
                  }
                  return d;
                })()}
                stroke="var(--brand)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                style={{ transition: "all 0.4s ease-out" }}
              />
            )}
          </svg>

          {/* Dots + year labels */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const isOpen = displayCard === i;

            return (
              <div
                key={n.title}
                className="absolute"
                style={{
                  left: `${x}px`,
                  top: `${DOT_Y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
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

                {/* Year label (above or below dot) */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 whitespace-nowrap"
                  style={{
                    top: WAVE_Y[i] < 50 ? "calc(100% + 6px)" : undefined,
                    bottom: WAVE_Y[i] >= 50 ? "calc(100% + 6px)" : undefined,
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

          {/* Connectors: dotted line from dot → card */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const isOpen = displayCard === i;

            return (
              <div
                key={`conn-${n.title}`}
                data-tl-conn
                aria-hidden="true"
                className="absolute w-px"
                style={{
                  left: `${x}px`,
                  top: `${DOT_Y + 10}px`,
                  height: `${CONN_H}px`,
                  transform: "translateX(-50%)",
                  transformOrigin: "top center",
                  background: isOpen
                    ? "repeating-linear-gradient(to bottom, var(--brand) 0, var(--brand) 3px, transparent 3px, transparent 7px)"
                    : "repeating-linear-gradient(to bottom, rgba(13,33,161,0.08) 0, rgba(13,33,161,0.08) 3px, transparent 3px, transparent 7px)",
                  transition: "background 0.3s ease-out",
                }}
              />
            );
          })}

          {/* Cards — positioned at dot's X, below connector */}
          {nodes.map((n, i) => {
            const x = dotX(i);
            const isOpen = displayCard === i;
            const Icon = n.icon;

            return (
              <div
                key={`card-${n.title}`}
                className="absolute"
                style={{
                  left: `${x - CARD_W / 2}px`,
                  top: `${CARD_TOP}px`,
                  width: `${CARD_W}px`,
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? "auto" : "none",
                  transition: "opacity 0.3s ease-out",
                  zIndex: isOpen ? 30 : 1,
                }}
              >
                <div
                  className="rounded-2xl border border-border bg-card shadow-xl overflow-visible"
                  style={{
                    perspective: "800px",
                    transformStyle: "preserve-3d",
                    animation:
                      isOpen && flipping === i
                        ? "tlCardFlip 0.5s ease-out"
                        : isOpen
                          ? "tlCardFadeIn 0.3s ease-out"
                          : "none",
                  }}
                >
                  {/* Accent top border — connects visually to the dotted line */}
                  <div
                    className="absolute -top-px left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300"
                    style={{
                      width: isOpen ? "40px" : "0px",
                      background: "var(--brand)",
                    }}
                  />

                  {n.image && (
                    <div className="relative h-36 w-full overflow-hidden rounded-t-2xl">
                      <Image
                        src={n.image}
                        alt={n.title}
                        fill
                        sizes={`${CARD_W}px`}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 border border-white/40 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
                        <Icon className="w-2.5 h-2.5" />
                        {n.tag}
                      </span>
                    </div>
                  )}
                  <div className="p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-brand/60 uppercase tracking-wider">
                        {n.year}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-brand/30" />
                      <span className="text-[9px] font-semibold text-accent-strong uppercase tracking-wider">
                        {n.oneLiner}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                      {n.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
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
            );
          })}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes tlCardFlip {
            0%   { opacity: 0; transform: rotateY(-90deg) scale(0.92); }
            60%  { opacity: 1; transform: rotateY(6deg) scale(1.01); }
            80%  { transform: rotateY(-2deg) scale(0.995); }
            100% { transform: rotateY(0deg) scale(1); }
          }
          @keyframes tlCardFadeIn {
            0%   { opacity: 0; transform: translateY(6px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `,
        }}
      />
    </section>
  );
}
