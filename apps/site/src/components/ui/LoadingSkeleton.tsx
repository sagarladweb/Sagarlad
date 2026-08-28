"use client";

import { useEffect, useState } from "react";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-[#e2e8f0]/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

/* ── Premium skeleton: full page hero + content blocks ── */
export function PremiumSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="relative h-[100svh] bg-foreground">
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-6">
          <Shimmer className="h-5 w-40 mb-6 rounded-full bg-white/10" />
          <Shimmer className="h-12 w-80 max-w-full mb-4 bg-white/10" />
          <Shimmer className="h-6 w-64 max-w-full mb-8 bg-white/10" />
          <Shimmer className="h-11 w-36 rounded-full bg-white/10" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-4">
              <Shimmer className="h-5 w-28 rounded-full" />
              <Shimmer className="h-8 w-3/4" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-5/6" />
            </div>
            <Shimmer className="w-full md:w-[300px] aspect-[3/4] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Normal skeleton: standard page with header + cards ── */
export function NormalSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="min-h-[60vh] py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {title && (
          <div className="text-center space-y-4">
            <Shimmer className="h-5 w-32 mx-auto rounded-full" />
            <Shimmer className="h-10 w-64 mx-auto" />
            <Shimmer className="h-4 w-96 max-w-full mx-auto" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <Shimmer className="h-40 w-full rounded-lg" />
              <Shimmer className="h-5 w-3/4" />
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Minimal skeleton: lightweight loader for fast pages ── */
export function MinimalSkeleton() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading{dots}</p>
      </div>
    </div>
  );
}
