"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { ArrowUpRight } from "lucide-react";

import { METRICS } from "@/lib/metrics";
import { SiteLogo } from "@/components/SiteLogo";
import { Pill } from "@/components/ui/Pill";

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
        { opacity: 0, y: 36, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" },
        }
      );

      gsap.fromTo(
        "[data-story-visual]",
        { opacity: 0, scale: 0.94, y: 50, filter: "blur(4px)" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
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
          { opacity: 0, y: 24, filter: "blur(3px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
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
      className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24"
      aria-label="About Sagar Lad"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[450px] w-[450px] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mobile: Pill + heading centered, then image, then content */}
        <div className="lg:hidden text-center" data-story-head>
          <Pill>About Sagar</Pill>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight text-[#1e293b]">
            A story of almost nothing, and everything.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Visual — first on mobile, left on desktop */}
          <div data-story-visual className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-brand-light/25 via-brand-light/10 to-transparent blur-2xl opacity-75"
              />
              <figure className="card-hover relative aspect-[4/5] rounded-xl overflow-hidden border border-border bg-card">
                <Image
                  src="/images/profile/about-3.webp"
                  alt="Sagar Lad"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-right-top sm:object-top"
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

          {/* Content — second on mobile, right on desktop */}
          <div className="lg:col-span-7 order-3 lg:order-2 text-center lg:text-left">
            <div data-story-head className="hidden lg:block">
              <Pill>About Sagar</Pill>
              <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight text-[#1e293b]">
                A story of almost nothing, and everything.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-[#64748b] leading-loose max-w-xl mx-auto lg:mx-0">
                From a small town in Gujarat to leading Data &amp; AI
                transformations across Europe. I left a comfortable life with no
                savings and no plan — then built it back through awareness,
                habit and early investing. Today I share everything I know
                through books, videos and a global community.
              </p>
            </div>
            <p className="mt-6 text-base sm:text-lg text-[#64748b] leading-loose max-w-xl mx-auto lg:mx-0 lg:hidden">
              From a small town in Gujarat to leading Data &amp; AI
              transformations across Europe. I left a comfortable life with no
              savings and no plan — then built it back through awareness,
              habit and early investing. Today I share everything I know
              through books, videos and a global community.
            </p>

            {/* Stats matrix */}
            <div className="mt-6 md:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  data-story-stat={s.value}
                  data-story-suffix={s.suffix}
                  className="text-center card-hover rounded-xl p-4"
                >
                  <p
                    data-story-num
                    className="font-display text-2xl sm:text-3xl font-extrabold text-[#1e293b] tabular-nums"
                  >
                    0{s.suffix}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="mt-6 md:mt-10 text-center sm:text-left">
              <Link
                href="/about"
                className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold"
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