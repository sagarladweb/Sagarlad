"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp, Users, Eye } from "lucide-react";
import { METRICS } from "@/lib/metrics";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Stat = {
  icon: typeof TrendingUp;
  value: string;
  display: string;
  label: string;
};

// Interpolate a running count into the target label's shape: renders
// "10,000+", "1M+" and "10K+" styles from the static METRICS string.
const formatCount = (v: number, display: string) => {
  if (display.includes("M")) return `${Math.round(v)}M+`;
  if (display.includes("K")) return `${Math.round(v)}K+`;
  return `${Math.round(v).toLocaleString("en-US")}+`;
};

const stats: Stat[] = [
  { icon: TrendingUp, value: METRICS.booksSold, display: METRICS.booksSold, label: "Books sold worldwide" },
  { icon: Users, value: METRICS.bookReaders, display: METRICS.bookReaders, label: "Book read views" },
  { icon: Eye, value: METRICS.communityReached, display: METRICS.communityReached, label: "Active community" },
];

export function BookStats() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Skip the count-up but still show the real numbers.
      el.querySelectorAll<HTMLElement>("[data-stat]").forEach((item) => {
        const numEl = item.querySelector("[data-num]");
        if (!numEl) return;
        numEl.textContent = item.dataset.display ?? "";
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((item, i) => {
        const numEl = item.querySelector("[data-num]");
        if (!numEl) return;
        const display = item.dataset.display ?? "";
        const target = Number(item.dataset.stat || "0");
        const counter = { v: 0 };
        const render = () => {
          numEl.textContent = formatCount(counter.v, display);
        };
        render();
        gsap.fromTo(
          item,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
        gsap.fromTo(
          counter,
          { v: 0 },
          {
            v: target,
            duration: 2.2,
            delay: 0.2 + i * 0.1,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="rounded-2xl border border-border bg-background/80 backdrop-blur px-3 py-6 sm:px-6 sm:py-8 grid grid-cols-3 divide-x divide-border"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          data-stat={s.value.replace(/[^0-9]/g, "")}
          data-display={s.display}
          className="flex flex-col items-center text-center px-2 sm:px-4 min-w-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-light/15 text-brand flex items-center justify-center mb-2.5">
            <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          </div>
          <p
            data-num
            className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight whitespace-nowrap tabular-nums"
          >
            0
          </p>
          <p className="mt-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}