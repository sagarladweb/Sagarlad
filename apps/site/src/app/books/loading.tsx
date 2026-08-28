"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function BooksLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Library (no hero — page starts here) ── */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <Shimmer className="h-5 w-28 rounded-full" />
              <Shimmer className="mt-3 h-8 sm:h-9 w-48" />
              <Shimmer className="mt-2 h-4 w-36" />
            </div>
            <Shimmer className="h-9 w-36 rounded-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerCard key={i} className="aspect-[2/3]" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Colophon ── */}
      <section className="py-16 md:py-24 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-7 w-48 mx-auto" />
          <Shimmer className="h-4 w-80 max-w-full mx-auto" />
          <Shimmer className="h-4 w-64 mx-auto" />
        </div>
      </section>
    </div>
  );
}
