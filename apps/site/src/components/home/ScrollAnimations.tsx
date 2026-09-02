"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

export function ScrollAnimations() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  /* Phase 1: mark hydrated */
  useEffect(() => {
    setReady(true);
  }, []);

  /* Phase 2: run GSAP only after hydration + paint */
  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | null = null;
    let rafId = 0;

    // Double rAF: ensures GSAP runs after React hydration + browser paint
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        ctx = gsap.context(() => {
          // ── Individual reveals ──────────────────────────────────────
          gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((item) => {
            const variant = item.dataset.animate ?? "up";
            const delay = parseFloat(item.dataset.delay ?? "0");

            const from: gsap.TweenVars = (() => {
              switch (variant) {
                case "left":
                  return { opacity: 0, x: -60, filter: "blur(4px)" };
                case "right":
                  return { opacity: 0, x: 60, filter: "blur(4px)" };
                case "zoom":
                  return { opacity: 0, scale: 0.92, filter: "blur(4px)" };
                case "blur":
                  return { opacity: 0, filter: "blur(12px)" };
                case "image":
                  return { opacity: 0, scale: 1.08 };
                default:
                  return { opacity: 0, y: 50, filter: "blur(4px)" };
              }
            })();

            const to: gsap.TweenVars = (() => {
              switch (variant) {
                case "image":
                  return {
                    opacity: 1,
                    scale: 1,
                    duration: 1.1,
                    ease: "power3.out",
                  };
                case "blur":
                  return {
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 1,
                    ease: "power2.out",
                  };
                default:
                  return {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.9,
                    ease: "power3.out",
                  };
              }
            })();

            gsap.fromTo(item, from, {
              ...to,
              delay,
              scrollTrigger: {
                trigger: item,
                start: "top 93%",
                toggleActions: "play none none none",
              },
            });
          });

          // ── Staggered groups ────────────────────────────────────────
          gsap.utils
            .toArray<HTMLElement>("[data-animate-group]")
            .forEach((group) => {
              const items = gsap.utils.toArray<HTMLElement>(
                "[data-animate-item]",
                group
              );
              if (!items.length) return;

              const variant = group.dataset.animate ?? "up";
              const fromY = variant === "zoom" ? 20 : 40;

              gsap.fromTo(
                items,
                {
                  opacity: 0,
                  y: fromY,
                  filter: "blur(3px)",
                },
                {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  duration: 0.75,
                  ease: "power3.out",
                  stagger: 0.1,
                  scrollTrigger: {
                    trigger: group,
                    start: "top 90%",
                    toggleActions: "play none none none",
                  },
                }
              );
            });

          // ── Parallax layers ─────────────────────────────────────────
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
            const speed = parseFloat(layer.dataset.parallax ?? "0.15");
            gsap.fromTo(
              layer,
              { y: `${-60 * speed}%` },
              {
                y: `${60 * speed}%`,
                ease: "none",
                scrollTrigger: {
                  trigger: layer.closest("[data-parallax-wrap]") ?? layer,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.5,
                },
              }
            );
          });
        });
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, [ready, pathname]);

  return null;
}
