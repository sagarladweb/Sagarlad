"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, BookOpen } from "lucide-react";
import { DESIGNATION } from "@/lib/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-word]",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.06 }
      );
      gsap.fromTo(
        "[data-hero-sub]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(
        "[data-hero-cta]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.7, stagger: 0.1 }
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
      {/* Full-bleed landscape hero — subject sits right, dark zone left where the copy lives */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/heroes/hero-home.webp"
          alt=""
          fill
          priority
          className="object-cover object-[70%_85%] sm:object-center"
          sizes="100vw"
        />
        {/* Left-to-right scrim: readable left copy, subject on the right stays visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-center py-32">
        <div className="max-w-3xl space-y-6">
          <p
            data-hero-sub
            className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-accent"
          >
            {DESIGNATION}
          </p>

          <h1
            data-hero-word
            className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-[1.02] text-white"
          >
            Sagar Lad
          </h1>

          <p
            data-hero-sub
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white"
          >
            Mind <span className="text-accent">Up.</span> Rise Within.
          </p>

          <p data-hero-sub className="max-w-xl text-base sm:text-lg text-white/85 leading-relaxed">
            Strengthen your mind, rise beyond your limits, succeed with
            purpose, and lift others.
          </p>
          <div data-hero-cta className="flex flex-wrap items-center gap-3">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4" />
              Get the MIND UP Theory
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
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
