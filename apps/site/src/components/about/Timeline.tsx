"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { BookOpen, GraduationCap, Briefcase, Mic, PenTool } from "lucide-react";

type TimelineNode = {
  year: string;
  title: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  href?: string;
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
    description: "BVM College — the foundation of my technical career begins in earnest.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: "TCS",
    description: "My professional journey begins — and soon takes me to Europe.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
  },
  {
    year: "2019 – 2020",
    title: "PG in Data Science",
    description: "IIIT Bangalore — the year that reshaped how I think, learn, and solve problems.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books Published",
    description: "First book in February 2022, sixth in March 2026 — writing alongside a full career.",
    tag: "Author",
    icon: PenTool,
    image: "/images/books/mindup-front.jpg",
    href: "/books",
  },
  {
    year: "2025 – 2026",
    title: "Masters in Gen AI",
    description: "Purdue University — sharpening the frontier, artificial intelligence done right.",
    tag: "Education",
    icon: GraduationCap,
  },
  {
    year: "2026",
    title: "First TEDx Speech",
    description: "Give a speech on AI to the TEDx stage.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
  },
];

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Horizontal grab-to-drag on desktop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
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
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.5;
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointerleave", onPointerUp);
    track.addEventListener("pointermove", onPointerMove);

    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointerleave", onPointerUp);
      track.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  // GSAP reveal animations
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
        "[data-tl-node]",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: trackRef.current, start: "top 85%" },
        }
      );

      // Animate the axis line width from 0
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

      {/* ── Mobile: Vertical timeline ── */}
      <div className="lg:hidden max-w-lg mx-auto px-4 sm:px-6">
        <div className="relative">
          {/* Vertical axis */}
          <div
            aria-hidden="true"
            className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-brand/40 via-brand/20 to-transparent"
          />
          <div className="space-y-10">
            {nodes.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={n.title} className="relative pl-12" data-tl-node>
                  {/* Dot */}
                  <div
                    aria-hidden="true"
                    className="absolute left-[13px] top-1 h-3.5 w-3.5 rounded-full border-2 border-brand bg-background z-10"
                    style={{ boxShadow: "0 0 0 4px var(--background)" }}
                  />

                  {/* Year */}
                  <span className="block text-xs font-bold uppercase tracking-wider text-brand mb-1">
                    {n.year}
                  </span>

                  {/* Card */}
                  <MobileCard node={n} Icon={Icon} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Desktop: Horizontal scroll ── */}
      <div className="hidden lg:block">
        <div
          ref={trackRef}
          className="overflow-x-auto overflow-y-hidden cursor-grab px-8 no-scrollbar"
          style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
        >
          {/* Axis line */}
          <div className="relative mx-auto" style={{ width: `${nodes.length * 280}px` }}>
            <div
              aria-hidden="true"
              data-tl-line
              className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent origin-left"
              style={{ transform: "translateY(-50%)" }}
            />

            <div className="relative flex items-center" style={{ minHeight: "420px" }}>
              {nodes.map((n, i) => {
                const Icon = n.icon;
                const above = i % 2 === 0;
                return (
                  <div
                    key={n.title}
                    data-tl-node
                    className="relative flex flex-col items-center"
                    style={{ width: "280px", flexShrink: 0 }}
                  >
                    {/* Dot on axis */}
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 -translate-x-1/2 h-3 w-3 rounded-full border-2 border-brand bg-background z-10 transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_0_6px_rgba(13,33,161,0.15)]"
                      style={{ top: "calc(50% - 6px)" }}
                    />

                    {/* Connector line */}
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 -translate-x-px w-px bg-brand/15"
                      style={{
                        height: "80px",
                        top: above ? "calc(50% - 86px)" : "calc(50% + 6px)",
                      }}
                    />

                    {/* Year label */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 text-center"
                      style={{
                        top: above ? "calc(50% - 110px)" : "calc(50% + 90px)",
                      }}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">
                        {n.year}
                      </span>
                    </div>

                    {/* Glassmorphism card */}
                    <DesktopCard node={n} Icon={Icon} above={above} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drag hint */}
        <p className="text-center mt-4 text-xs text-muted-foreground/60 select-none">
          ← drag to explore →
        </p>
      </div>
    </section>
  );
}

/* ── Mobile Card ─────────────────────────────────────── */
function MobileCard({ node, Icon }: { node: TimelineNode; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-brand-light/60 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-light/10 grid place-items-center text-brand">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
              {node.tag}
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-base font-bold leading-snug group-hover:text-brand transition-colors">
            {node.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {node.description}
          </p>
          {node.image && (
            <div className="mt-3 relative h-28 w-full rounded-lg overflow-hidden">
              <Image
                src={node.image}
                alt={node.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          {node.href && (
            <Link
              href={node.href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              View books →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Desktop Card (glassmorphism on hover) ─────────── */
function DesktopCard({
  node,
  Icon,
  above,
}: {
  node: TimelineNode;
  Icon: React.ComponentType<{ className?: string }>;
  above: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-56 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto z-20"
      style={{
        [above ? "bottom" : "top"]: "calc(50% + 24px)",
      }}
    >
      <div className="rounded-xl border border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur-xl shadow-2xl p-4 overflow-hidden">
        {/* Image */}
        {node.image && (
          <div className="relative h-24 w-full rounded-lg overflow-hidden mb-3 -mx-1">
            <Image
              src={node.image}
              alt={node.title}
              fill
              sizes="224px"
              className="object-cover object-top"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-brand/10 grid place-items-center text-brand">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-strong">
            {node.tag}
          </span>
        </div>
        <h3 className="font-display text-sm font-bold leading-snug text-foreground">
          {node.title}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          {node.description}
        </p>
        {node.href && (
          <Link
            href={node.href}
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
          >
            View books →
          </Link>
        )}
      </div>
    </div>
  );
}
