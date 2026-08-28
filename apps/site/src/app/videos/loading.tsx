"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── PageHeader ── */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Shimmer className="h-6 w-16 rounded-full" />
          <Shimmer className="mt-3 h-10 sm:h-12 w-48" />
          <Shimmer className="mt-4 h-5 w-72 max-w-full" />
        </div>
      </header>

      {/* ── Section heading ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
        <Shimmer className="h-5 w-24 rounded-full" />
      </div>

      {/* ── Video Grid ── */}
      <section className="py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <ShimmerImage className="aspect-video rounded-none" />
                <div className="p-4 space-y-2">
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA card ── */}
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ShimmerCard className="w-full h-48 sm:h-56" />
        </div>
      </section>
    </div>
  );
}
