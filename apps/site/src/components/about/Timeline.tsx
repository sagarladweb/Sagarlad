"use client";

import { useEffect, useRef } from "react";
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
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  href?: string;
  hrefLabel?: string;
  align: "left" | "right";
};

const nodes: Node[] = [
  {
    year: "2009",
    title: "School Education",
    description:
      "Years of hard work in a small town in Gujarat pay off — earning a place at a top university for computer engineering.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
    align: "left",
  },
  {
    year: "2009 – 2013",
    title: "B.E. Computer Engineering",
    description:
      "BVM College — four years of deep technical learning and late-night coding that shaped everything after.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
    align: "right",
  },
  {
    year: "2013",
    title: "TCS — Career Begins",
    description:
      "Joining TCS marks the start of a journey across continents — working with CXOs, leading data transformations across Europe.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
    align: "left",
  },
  {
    year: "2019 – 2020",
    title: "PG in Data Science",
    description:
      "IIIT Bangalore — statistical thinking, machine learning, and a whole new lens on solving real-world problems.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
    align: "right",
  },
  {
    year: "2022 – 2026",
    title: "Six Books Published",
    description:
      "Finance, AI, habits, self-growth — each book a chapter of what I learned the hard way, so others don't have to.",
    tag: "Author",
    icon: PenTool,
    image: "/images/books/mindup-front.jpg",
    href: "/books",
    hrefLabel: "View all books",
    align: "left",
  },
  {
    year: "2025 – 2026",
    title: "Masters in Gen AI",
    description:
      "Purdue University — building AI systems that are responsible, practical, and genuinely useful.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/speaking/candid-presentation.webp",
    align: "right",
  },
  {
    year: "2026",
    title: "First TEDx Speech",
    description:
      "Taking the TEDx stage to share what years of hands-on experience taught me about AI and decision-making.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
    align: "left",
  },
];

function TimelineCard({ node }: { node: Node }) {
  const Icon = node.icon;
  const isRight = node.align === "right";

  return (
    <div
      data-tl-card
      className={`relative w-full md:w-[calc(50%-2rem)] ${
        isRight ? "md:ml-auto" : ""
      }`}
    >
      {/* Connector line to axis (desktop) */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-8 h-px bg-brand/20"
        style={{
          [isRight ? "right" : "left"]: "100%",
          width: "2rem",
        }}
      />

      <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {node.image && (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={node.image}
              alt={node.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-right-top sm:object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 border border-white/40 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm bg-white/10">
              <Icon className="w-3 h-3" />
              {node.tag}
            </span>
          </div>
        )}

        <div className="p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
            {node.year}
          </span>
          <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-foreground">
            {node.title}
          </h3>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            {node.description}
          </p>
          {node.href && (
            <Link
              href={node.href}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {node.hrefLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);

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
        "[data-tl-axis]",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: "power2.out",
          transformOrigin: "top center",
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );

      gsap.utils.toArray<HTMLElement>("[data-tl-card]").forEach((card) => {
        const isRight = card.classList.contains("md:ml-auto");
        gsap.fromTo(
          card,
          { opacity: 0, x: isRight ? 60 : -60, filter: "blur(4px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-tl-dot]").forEach((dot) => {
        gsap.fromTo(
          dot,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.5,
            ease: "back.out(2.5)",
            scrollTrigger: {
              trigger: dot,
              start: "top 85%",
            },
          }
        );
      });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 md:mb-16">
        <div className="text-center" data-tl-heading>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand border border-brand/20 rounded-full px-4 py-1.5 bg-transparent">
            Where it started &amp; key moments
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            The story, in dates
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            A journey through the chapters that shaped everything.
          </p>
        </div>
      </div>

      {/* Timeline track */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Vertical axis */}
        <div
          aria-hidden="true"
          data-tl-axis
          className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand/40 via-brand/20 to-transparent -translate-x-1/2"
        />

        {/* Nodes */}
        <div className="space-y-12 md:space-y-16">
          {nodes.map((node) => {
            const Icon = node.icon;
            const isRight = node.align === "right";

            return (
              <div
                key={node.title}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 ${
                  isRight ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Dot on axis */}
                <div
                  data-tl-dot
                  className="absolute left-4 sm:left-1/2 top-8 md:top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-[2.5px] border-brand bg-background shadow-sm">
                    <span className="block h-2 w-2 rounded-full bg-brand" />
                  </span>
                </div>

                {/* Card */}
                <div className="w-full md:w-[calc(50%-2rem)] ml-10 sm:ml-0 md:ml-0">
                  <TimelineCard node={node} />
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block w-[calc(50%-2rem)]" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
