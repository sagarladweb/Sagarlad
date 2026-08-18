"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollAnimations() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Fade-up reveal for individual elements — reverses on scroll back up.
      gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((item) => {
        const variant = item.dataset.animate ?? "up";
        const delay = parseFloat(item.dataset.delay ?? "0");

        const from: gsap.TweenVars =
          variant === "left"
            ? { opacity: 0, x: -48 }
            : variant === "right"
              ? { opacity: 0, x: 48 }
              : variant === "zoom"
                ? { opacity: 0, scale: 0.9 }
                : { opacity: 0, y: 48 };

        gsap.fromTo(
          item,
          from,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.9,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Staggered groups — each child reveals in sequence when section is reached.
      gsap.utils.toArray<HTMLElement>("[data-animate-group]").forEach((group) => {
        const items = gsap.utils.toArray<HTMLElement>("[data-animate-item]", group);
        if (!items.length) return;
        const fromY = group.dataset.animate === "zoom" ? 24 : 40;
        gsap.fromTo(
          items,
          { opacity: 0, y: fromY },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: {
              trigger: group,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Parallax layers — scrub-linked so they glide and reverse naturally.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallax ?? "0.2");
        gsap.fromTo(
          layer,
          { y: `${-100 * speed}%` },
          {
            y: `${100 * speed}%`,
            ease: "none",
            scrollTrigger: {
              trigger: layer.closest("[data-parallax-wrap]") ?? layer,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return <div ref={root} aria-hidden="true" className="contents" />;
}
