"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, BookOpen } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { METRICS } from "@/lib/metrics";
import { SiteLogo } from "@/components/SiteLogo";

const stats = [
  { value: Number(METRICS.yearsExperience), suffix: "+", label: "Years in tech & data" },
  { value: Number(METRICS.countriesWorked), suffix: "+", label: "Countries worked" },
  { value: Number(METRICS.booksPublished), suffix: "+", label: "Published books" },
  { value: Number(METRICS.communityReached.replace(/[^0-9]/g, "")), suffix: "K+", label: "Community reached" },
];

export function AboutMe() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Skip the count-up but still show the real numbers.
      el.querySelectorAll<HTMLElement>("[data-story-stat]").forEach((card) => {
        const numEl = card.querySelector("[data-story-num]");
        if (!numEl) return;
        const target = Number(card.dataset.storyStat || "0");
        const suffix = card.dataset.storySuffix || "";
        numEl.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-story-head]",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" },
        }
      );

      gsap.fromTo(
        "[data-story-visual]",
        { opacity: 0, scale: 0.94, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none none" },
        }
      );

      const statCards = gsap.utils.toArray<HTMLElement>("[data-story-stat]");
      statCards.forEach((card, i) => {
        const numEl = card.querySelector("[data-story-num]");
        if (!numEl) return;
        const target = Number(card.dataset.storyStat || "0");
        const suffix = card.dataset.storySuffix || "";
        const counter = { v: 0 };
        const render = () => {
          numEl.textContent = `${Math.round(counter.v).toLocaleString("en-US")}${suffix}`;
        };
        render();
        gsap.fromTo(
          card,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
        gsap.fromTo(
          counter,
          { v: 0 },
          {
            v: target,
            duration: 2,
            delay: 0.15 + i * 0.08,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden border-b border-border bg-background py-20 md:py-24"
      aria-label="About Sagar Lad"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[450px] w-[450px] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual */}
          <div data-story-visual className="lg:col-span-5 relative order-1">
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-brand-light/25 via-brand-light/10 to-transparent blur-2xl opacity-75"
              />
              <figure className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-card">
                <Image
                  src="/images/sagar-author.png"
                  alt="Sagar Lad"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                  priority
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                />
                <figcaption className="absolute bottom-0 inset-x-0 p-7 text-white">
                  <SiteLogo light className="h-12 w-auto" />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                    Author · Investor · Public Speaker
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-7 order-2 space-y-8">
            <div data-story-head>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-strong">
                <BookOpen className="w-3.5 h-3.5" /> About Sagar
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                A story of almost nothing, and everything.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                From a small town in Gujarat to leading Data &amp; AI
                transformations across Europe. I left a comfortable life with no
                savings and no plan — then built it back through awareness,
                habit and early investing. Today I share everything I know
                through books, videos and a global community.
              </p>
            </div>

            {/* Stats matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  data-story-stat={s.value}
                  data-story-suffix={s.suffix}
                  className="group rounded-2xl border border-border bg-card/70 p-4 text-center hover:border-brand-light/70 hover:shadow-md transition-all"
                >
                  <p
                    data-story-num
                    className="font-display text-2xl sm:text-3xl font-extrabold text-accent-strong tabular-nums"
                  >
                    0{s.suffix}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold hover:opacity-95 transition-opacity shadow-lg"
              >
                More about me <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}