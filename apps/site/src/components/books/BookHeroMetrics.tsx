"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { TrendingUp, Users, Eye } from "lucide-react";

const metrics = [
  { icon: TrendingUp, value: 10000, suffix: "+", label: "Books sold" },
  { icon: Users, value: 1, suffix: "M+", label: "Readers worldwide" },
  { icon: Eye, value: 10, suffix: "K+", label: "Community reached" },
];

export function BookHeroMetrics() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-stat]").forEach((card) => {
        const numEl = card.querySelector("[data-stat-num]");
        if (!numEl) return;
        const target = Number(card.dataset.stat || "0");
        const suffix = card.dataset.statSuffix || "";
        numEl.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((card, i) => {
        const numEl = card.querySelector("[data-stat-num]");
        if (!numEl) return;
        const target = Number(card.dataset.stat || "0");
        const suffix = card.dataset.statSuffix || "";
        const counter = { v: 0 };
        const render = () => {
          numEl.textContent = `${Math.round(counter.v).toLocaleString("en-US")}${suffix}`;
        };
        render();
        gsap.fromTo(
          counter,
          { v: 0 },
          {
            v: target,
            duration: 2,
            delay: 0.4 + i * 0.12,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
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
      className="card-hover grid grid-cols-3 gap-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 sm:p-6 divide-x divide-border/40"
    >
      {metrics.map((s) => (
        <div
          key={s.label}
          data-stat={s.value}
          data-stat-suffix={s.suffix}
          className="flex flex-col items-center text-center px-2 sm:px-3 card-hover rounded-lg py-2"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-light/15 text-brand flex items-center justify-center mb-3">
            <s.icon className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <p className="font-display text-lg sm:text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            <span data-stat-num>0{s.suffix}</span>
          </p>
          <p className="mt-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground leading-tight">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
