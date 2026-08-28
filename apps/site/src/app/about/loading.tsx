"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function AboutLoading() {
  return (
    <div className="min-h-screen">
      {/* ── Hero (dark full-viewport) ── */}
      <section className="relative h-[100svh] bg-foreground overflow-hidden flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl space-y-5">
            <Shimmer className="h-10 sm:h-12 w-72 opacity-20" />
            <Shimmer className="h-4 w-full max-w-md opacity-20" />
            <Shimmer className="h-4 w-3/4 max-w-sm opacity-20" />
          </div>
        </div>
      </section>

      {/* ── Sticky nav ── */}
      <div className="sticky top-14 sm:top-16 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-9 w-28 rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* ── Stats band ── */}
      <section className="py-12 md:py-16 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-9 w-20 mx-auto" />
                <Shimmer className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Belief section ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <Shimmer className="h-6 w-16 rounded-full mx-auto" />
            <Shimmer className="h-8 w-72 mx-auto" />
            <Shimmer className="h-4 w-full max-w-lg mx-auto" />
            <Shimmer className="h-4 w-3/4 max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* ── Rules section ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-8 w-64 mx-auto" />
          <Shimmer className="h-4 w-80 max-w-full mx-auto" />
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <Shimmer className="h-4 w-24 mx-auto rounded-full" />
          <Shimmer className="h-8 w-72 mx-auto" />
          <Shimmer className="h-4 w-80 max-w-full mx-auto" />
          {/* Wave track */}
          <div className="relative mt-12 h-48 flex items-center">
            <Shimmer className="h-1 w-full rounded-full" />
          </div>
          {/* Timeline card */}
          <ShimmerCard className="w-full h-56 sm:h-64" />
        </div>
      </section>

      {/* ── Runner section ── */}
      <section className="py-16 md:py-24 border-b border-border bg-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <Shimmer className="h-8 w-56" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-4 w-2/3" />
          </div>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <ShimmerCard key={i} className="w-28 h-36 sm:w-32 sm:h-40 shrink-0" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Connect CTA ── */}
      <section className="py-16 md:py-24 bg-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-8 w-56 mx-auto" />
          <Shimmer className="h-4 w-64 mx-auto" />
          <div className="flex justify-center gap-3 pt-2">
            <Shimmer className="h-12 w-28 rounded-full" />
            <Shimmer className="h-12 w-28 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
