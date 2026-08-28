"use client";

import { Shimmer, ShimmerCard, ShimmerCircle, ShimmerImage } from "@/components/ui/Shimmer";

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero (white, 2-col with portrait) ── */}
      <section className="relative overflow-hidden border-b border-border bg-background pt-20 sm:pt-28 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
            {/* Left: text */}
            <div className="flex-1 space-y-4">
              <Shimmer className="h-8 w-36 rounded-full" />
              <Shimmer className="h-10 sm:h-12 w-64" />
              <Shimmer className="h-4 w-full max-w-md" />
              <Shimmer className="h-4 w-3/4 max-w-sm" />
              <div className="space-y-3 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Shimmer className="h-4 w-4 rounded-full shrink-0" />
                    <Shimmer className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </div>
            {/* Right: portrait */}
            <div className="shrink-0 relative w-56 sm:w-64 md:w-80">
              <ShimmerImage className="w-full aspect-[3/4]" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" style={{ maskImage: "linear-gradient(to bottom, transparent 18%, black 55%)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + Sidebar ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Form */}
          <div className="flex-1 space-y-5">
            <Shimmer className="h-7 w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-12 w-full rounded-xl" />
              </div>
            ))}
            <div className="space-y-2">
              <Shimmer className="h-4 w-16" />
              <Shimmer className="h-28 w-full rounded-xl" />
            </div>
            <Shimmer className="h-12 w-32 rounded-full" />
          </div>
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-5">
            {[1, 2, 3].map((i) => (
              <ShimmerCard key={i} className="p-5 h-28" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
