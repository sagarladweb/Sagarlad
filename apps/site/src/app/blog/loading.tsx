"use client";

import { Shimmer, ShimmerCircle, ShimmerImage } from "@/components/ui/Shimmer";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 overflow-x-clip">
        {/* ── Profile Header ── */}
        <header className="pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
            <ShimmerCircle className="h-28 w-28 sm:h-36 sm:w-36 shrink-0" />
            <div className="flex-1 text-center sm:text-left space-y-4">
              <Shimmer className="h-8 w-48 mx-auto sm:mx-0" />
              <Shimmer className="h-4 w-72 max-w-full mx-auto sm:mx-0" />
              <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 text-sm">
                <Shimmer className="h-4 w-20 rounded-full" />
                <Shimmer className="h-4 w-20 rounded-full" />
                <Shimmer className="h-4 w-20 rounded-full" />
              </div>
              <Shimmer className="h-3.5 w-full max-w-lg" />
              <Shimmer className="h-3.5 w-4/5 max-w-md" />
              <div className="flex gap-3 justify-center sm:justify-start">
                <Shimmer className="h-10 w-28 rounded-full" />
                <Shimmer className="h-10 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* ── Tabs ── */}
        <nav className="mt-10 border-t border-border flex items-stretch">
          <Shimmer className="h-12 flex-1 rounded-t-lg" />
          <Shimmer className="h-12 flex-1 rounded-t-lg opacity-50" />
        </nav>

        {/* ── Search + Categories ── */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Shimmer className="h-10 w-full lg:w-60 rounded-full" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Shimmer key={i} className="h-8 w-20 rounded-full shrink-0" />
            ))}
          </div>
        </div>

        {/* ── Post Grid ── */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <ShimmerImage className="w-full h-full rounded-none" />
            </div>
          ))}
        </div>

        {/* ── Pagination ── */}
        <nav className="mt-12 flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-9 w-16 rounded-full" />
          ))}
        </nav>
      </div>
    </div>
  );
}
