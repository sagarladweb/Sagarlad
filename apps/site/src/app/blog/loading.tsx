"use client";

import { Shimmer, ShimmerCard, ShimmerCircle, ShimmerImage } from "@/components/ui/Shimmer";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Profile Header ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ShimmerCircle className="w-28 h-28 md:w-32 md:h-32 shrink-0" />
            <div className="flex-1 text-center md:text-left space-y-3">
              <Shimmer className="h-8 w-48 mx-auto md:mx-0" />
              <Shimmer className="h-4 w-72 max-w-full mx-auto md:mx-0" />
              <div className="flex items-center gap-6 justify-center md:justify-start pt-1">
                <Shimmer className="h-4 w-20 rounded-full" />
                <Shimmer className="h-4 w-20 rounded-full" />
              </div>
              <Shimmer className="h-3.5 w-full max-w-lg" />
              <Shimmer className="h-3.5 w-4/5 max-w-md" />
              <div className="flex gap-3 justify-center md:justify-start">
                <Shimmer className="h-10 w-28 rounded-full" />
                <Shimmer className="h-10 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          <Shimmer className="h-12 w-24 rounded-t-lg" />
          <Shimmer className="h-12 w-24 rounded-t-lg opacity-50" />
        </div>
      </div>

      {/* ── Search + Categories ── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <Shimmer className="h-10 w-full rounded-full" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Shimmer key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Post Grid ── */}
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden bg-card">
                <ShimmerImage className="aspect-[4/3] rounded-none" />
                <div className="p-5 space-y-3">
                  <Shimmer className="h-3 w-16 rounded-full" />
                  <Shimmer className="h-5 w-full" />
                  <Shimmer className="h-4 w-4/5" />
                  <Shimmer className="h-3 w-24 mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pagination ── */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
