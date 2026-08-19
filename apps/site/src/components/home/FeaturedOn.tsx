"use client";

import { useEffect, useRef, useState } from "react";

const PRESS = [
  { name: "Packt", src: "/images/featured/packt_logo.png" },
  { name: "Apress", src: "/images/featured/apress.png" },
  { name: "BPB", src: "/images/featured/BPB.png" },
  {
    name: "Medium",
    src: "/images/featured/medium-logo-png.png",
  },
  {
    name: "YouTube",
    src: "/images/featured/YouTube_Logo.png",
  },
  { name: "C# Corner", src: "/images/featured/c%23corner.png" },
  { name: "Amazon Kindle", src: "/images/featured/amazon-kindle.png" },
];

const BATCH = 3;

function Logo({ name, src }: { name: string; src: string }) {
  return (
    <span className="flex h-10 w-24 items-center justify-center sm:h-12 sm:w-28">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        title={name}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </span>
  );
}

export function FeaturedOn() {
  const [pos, setPos] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only auto-rotate while the section is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setPos((p) => (p + 1) % PRESS.length), 3000);
    return () => clearInterval(t);
  }, [running]);

  // Batch of 3 logos starting at pos, wrapping so the last batch is full.
  const batch = (from: number) =>
    Array.from({ length: BATCH }, (_, i) => PRESS[(from + i) % PRESS.length]);

  return (
    <section
      className="py-12 border-b border-border bg-card/40"
      aria-label="Featured in the press"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Featured on
        </p>

        {/* Mobile — carousel, 3 logos at a time */}
        <div ref={ref} className="mt-8 sm:hidden overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${pos * 100}%)` }}
          >
            {PRESS.map((_, i) => (
              <div
                key={i}
                className="w-full shrink-0 grid grid-cols-3 items-center justify-items-center gap-y-6"
                aria-hidden={i !== pos}
              >
                {batch(i).map((l) => (
                  <Logo key={`${l.name}-${i}`} name={l.name} src={l.src} />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden="true">
            {PRESS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === pos ? "w-4 bg-accent" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop — static wrap grid */}
        <div className="mt-8 hidden sm:flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-8">
          {PRESS.map((logo) => (
            <Logo key={logo.name} name={logo.name} src={logo.src} />
          ))}
        </div>
      </div>
    </section>
  );
}