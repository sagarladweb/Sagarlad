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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: just show everything immediately
      document.body.classList.add("gsap-ready");
      document.querySelectorAll<HTMLElement>("[data-animate], [data-animate-item]").forEach((el) => {
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.transform = "none";
      });
      return;
    }

    let ctx: gsap.Context | null = null;
    let rafId = 0;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    // Double rAF: ensures GSAP runs after React hydration + browser paint
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        // Clear CSS initial hidden state — GSAP takes over from here
        document.body.classList.add("gsap-ready");

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

            // Check if element is already in viewport — if so, reveal immediately
            // instead of relying on ScrollTrigger which may not fire for
            // above-the-fold content on slow/cold-start loads.
            const rect = item.getBoundingClientRect();
            const alreadyVisible = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

            if (alreadyVisible && delay === 0) {
              // Element is in viewport: set to final state immediately (no animation)
              gsap.set(item, { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" });
            } else {
              gsap.fromTo(item, from, {
                ...to,
                delay,
                scrollTrigger: {
                  trigger: item,
                  start: "top 93%",
                  toggleActions: "play none none none",
                },
              });
            }
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

              const rect = group.getBoundingClientRect();
              const alreadyVisible = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

              if (alreadyVisible) {
                items.forEach((el) => {
                  el.style.opacity = "1";
                  el.style.filter = "none";
                  el.style.transform = "none";
                });
              } else {
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
              }
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

        // Safety net: if any [data-animate] elements are still invisible
        // after 3s (GSAP loaded but ScrollTrigger didn't fire for some),
        // force them visible.
        safetyTimer = setTimeout(() => {
          document.querySelectorAll<HTMLElement>("[data-animate]").forEach((el) => {
            const s = getComputedStyle(el);
            if (s.opacity === "0" || s.opacity === "0.3" || parseFloat(s.opacity) < 0.5) {
              el.style.opacity = "1";
              el.style.filter = "none";
              el.style.transform = "none";
              el.style.transition = "opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease";
            }
          });
          document.querySelectorAll<HTMLElement>("[data-animate-item]").forEach((el) => {
            const s = getComputedStyle(el);
            if (parseFloat(s.opacity) < 0.5) {
              el.style.opacity = "1";
              el.style.filter = "none";
              el.style.transform = "none";
              el.style.transition = "opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease";
            }
          });
        }, 3000);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (safetyTimer) clearTimeout(safetyTimer);
      document.body.classList.remove("gsap-ready");
      ctx?.revert();
    };
  }, [ready, pathname]);

  return null;
}
