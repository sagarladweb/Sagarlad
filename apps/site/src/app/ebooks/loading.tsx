"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function EbooksLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── PageHeader ── */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="mt-3 h-10 sm:h-12 w-56" />
          <Shimmer className="mt-4 h-5 w-80 max-w-full" />
        </div>
      </header>

      {/* ── Book Grid ── */}
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <ShimmerImage className="aspect-[2/3] rounded-none" />
                <div className="p-4 space-y-2">
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
