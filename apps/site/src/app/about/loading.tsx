"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      {/* ── Hero (dark full-viewport) ── */}
      <section className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground overflow-hidden flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full min-h-[100svh] flex flex-col justify-end">
          <div className="max-w-3xl text-center sm:text-left mt-auto space-y-5">
            <Shimmer className="h-10 sm:h-12 w-72 opacity-20" />
            <Shimmer className="h-4 w-full max-w-md opacity-20" />
            <Shimmer className="h-4 w-3/4 max-w-sm opacity-20" />
          </div>
        </div>
      </section>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-3 md:justify-center">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-8 w-28 rounded-full shrink-0" />
          ))}
        </div>
      </nav>

      {/* ── Stats band ── */}
      <section className="border-b border-border bg-card/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col text-center md:text-left">
                <Shimmer className="h-12 md:h-14 w-20 mx-auto md:mx-0" />
                <Shimmer className="h-4 w-24 mx-auto md:mx-0 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Belief section ── */}
      <section className="scroll-mt-32 py-20 md:py-28 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-6 w-16 rounded-full mx-auto" />
          <Shimmer className="h-8 w-72 mx-auto" />
          <Shimmer className="h-4 w-full max-w-lg mx-auto" />
          <Shimmer className="h-4 w-3/4 max-w-md mx-auto" />
        </div>
      </section>

      {/* ── Rules section ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-8 w-64 mx-auto" />
          <Shimmer className="h-4 w-80 max-w-full mx-auto" />
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="scroll-mt-32 py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <Shimmer className="h-4 w-24 mx-auto rounded-full" />
          <Shimmer className="h-8 w-72 mx-auto" />
          <Shimmer className="h-4 w-80 max-w-full mx-auto" />
          <div className="relative mt-12 h-48 flex items-center">
            <Shimmer className="h-1 w-full rounded-full" />
          </div>
          <ShimmerCard className="w-full h-56 sm:h-64" />
        </div>
      </section>

      {/* ── Runner section ── */}
      <section className="scroll-mt-32 py-16 md:py-28 border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 text-center lg:text-left space-y-4">
              <Shimmer className="h-8 w-56 mx-auto lg:mx-0" />
              <Shimmer className="h-4 w-full mx-auto lg:mx-0" />
              <Shimmer className="h-4 w-3/4 mx-auto lg:mx-0" />
              <Shimmer className="h-4 w-2/3 mx-auto lg:mx-0" />
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-background p-5 text-center">
                  <Shimmer className="h-4 w-24 mx-auto" />
                  <Shimmer className="h-3 w-16 mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Connect CTA ── */}
      <section className="scroll-mt-32 py-20 md:py-28 bg-card/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <Shimmer className="h-8 w-56 mx-auto" />
          <Shimmer className="h-4 w-64 mx-auto" />
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Shimmer className="h-12 w-36 rounded-full" />
            <Shimmer className="h-12 w-36 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
