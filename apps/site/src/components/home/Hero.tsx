"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { ArrowRight, BookOpen } from "lucide-react";
import { DESIGNATION } from "@/lib/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background image: subtle zoom-in
      tl.fromTo(
        "[data-hero-bg]",
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
        0
      );

      // Designation line: fade up + blur clear
      tl.fromTo(
        "[data-hero-desig]",
        { opacity: 0, y: 16, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
        0.3
      );

      // Name: word-by-word stagger with blur clear
      tl.fromTo(
        "[data-hero-word]",
        { opacity: 0, y: 50, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.12,
        },
        0.5
      );

      // Tagline: fade up + blur clear
      tl.fromTo(
        "[data-hero-tag]",
        { opacity: 0, y: 24, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
        1.0
      );

      // Description: fade up
      tl.fromTo(
        "[data-hero-desc]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.2
      );

      // CTAs: staggered fade up with slight scale
      tl.fromTo(
        "[data-hero-cta]",
        { opacity: 0, y: 16, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
        },
        1.4
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground text-background overflow-hidden"
      aria-label="Introduction"
    >
      {/* Full-bleed landscape hero */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          data-hero-bg
          src="/images/heroes/hero-home.webp"
          alt=""
          fill
          priority
          className="object-cover object-[70%_85%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-3xl space-y-6 text-center mx-auto sm:text-left sm:mx-0 mt-auto">
          <p
            data-hero-desig
            className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-accent"
          >
            {DESIGNATION}
          </p>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-[1.02] text-white">
            <span data-hero-word className="inline-block">Sagar</span>{" "}
            <span data-hero-word className="inline-block">Lad</span>
          </h1>

          <p
            data-hero-tag
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white"
          >
            Mind <span className="text-accent">Up.</span> Rise Within.
          </p>

          <p
            data-hero-desc
            className="max-w-xl text-base sm:text-lg text-white/85 leading-relaxed"
          >
            Strengthen your mind, rise beyond your limits, succeed with
            purpose, and lift others.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Link
              href="/books"
              data-hero-cta
              className="hero-cta-primary inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              Get the MIND UP Theory
            </Link>
            <Link
              href="/blog"
              data-hero-cta
              className="hero-cta-secondary inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3 text-sm font-semibold text-white"
            >
              Read the blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
