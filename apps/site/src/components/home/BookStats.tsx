"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { TrendingUp, Users, Eye } from "lucide-react";
import { METRICS } from "@/lib/metrics";

type Stat = {
  icon: typeof TrendingUp;
  value: string;
  display: string;
  label: string;
};

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
  const playedRef = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const items = el.querySelectorAll<HTMLElement>("[data-stat]");
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => {
        const numEl = item.querySelector("[data-num]");
        if (numEl) numEl.textContent = item.dataset.display ?? "";
      });
      return;
    }

    let ctx: gsap.Context | null = null;

    const animate = () => {
      ctx?.revert();
      items.forEach((item) => {
        const numEl = item.querySelector("[data-num]");
        if (numEl) numEl.textContent = "0";
      });

      ctx = gsap.context(() => {
        items.forEach((item, i) => {
          const numEl = item.querySelector("[data-num]");
          if (!numEl) return;
          const display = item.dataset.display ?? "";
          const target = Number(item.dataset.stat || "0");
          const counter = { v: 0 };

          gsap.fromTo(
            item,
            { opacity: 0, y: 24, filter: "blur(3px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.7,
              delay: i * 0.1,
              ease: "power3.out",
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
              onUpdate: () => {
                numEl.textContent = formatCount(counter.v, display);
              },
            }
          );
        });
      }, el);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          playedRef.current = true;
        } else if (playedRef.current) {
          ctx?.revert();
          ctx = null;
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={root}
      className="rounded-lg border border-border bg-background/80 backdrop-blur px-3 py-6 sm:px-6 sm:py-8 grid grid-cols-3 divide-x divide-border"
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
