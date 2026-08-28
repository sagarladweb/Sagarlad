"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

const VARIANT_CLASS: Record<string, string> = {
  left: "gs-left",
  right: "gs-right",
  zoom: "gs-zoom",
  blur: "gs-blur",
  image: "gs-image",
  up: "gs-hidden",
};

export function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        /* ── Individual reveals ────────────────────────────────────── */
        gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((item) => {
          const variant = item.dataset.animate ?? "up";
          const delay = parseFloat(item.dataset.delay ?? "0");

          /* Add CSS class that matches server-rendered initial state */
          const cls = VARIANT_CLASS[variant] ?? "gs-hidden";
          item.classList.add(cls);

          const to: gsap.TweenVars = (() => {
            switch (variant) {
              case "image":
                return { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" };
              case "blur":
                return { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" };
              default:
                return { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" };
            }
          })();

          gsap.to(item, {
            ...to,
            delay,
            scrollTrigger: {
              trigger: item,
              start: "top 93%",
              toggleActions: "play none none none",
            },
            onComplete() {
              item.classList.remove(cls);
              item.style.cssText = "";
            },
          });
        });

        /* ── Staggered groups ──────────────────────────────────────── */
        gsap.utils
          .toArray<HTMLElement>("[data-animate-group]")
          .forEach((group) => {
            const items = gsap.utils.toArray<HTMLElement>(
              "[data-animate-item]",
              group
            );
            if (!items.length) return;

            const variant = group.dataset.animate ?? "up";
            const gClass = variant === "zoom" ? "gs-group-item-zoom" : "gs-group-item";

            items.forEach((el) => el.classList.add(gClass));

            gsap.to(items, {
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
              onComplete() {
                items.forEach((el) => {
                  el.classList.remove(gClass);
                  el.style.cssText = "";
                });
              },
            });
          });

        /* ── Parallax layers ───────────────────────────────────────── */
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

      return () => ctx.revert();
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
