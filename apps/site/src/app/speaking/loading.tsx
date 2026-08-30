"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function SpeakingLoading() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-background pt-20 sm:pt-28 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-6 w-24 rounded-full mx-auto" />
          <Shimmer className="h-10 sm:h-12 w-72 mx-auto" />
          <Shimmer className="h-4 w-full max-w-md mx-auto" />
          <Shimmer className="h-4 w-3/4 max-w-sm mx-auto" />
          <div className="flex justify-center gap-3 pt-4">
            <Shimmer className="h-12 w-36 rounded-full" />
            <Shimmer className="h-12 w-36 rounded-full" />
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <Shimmer className="h-48 sm:h-56 rounded-xl" />
                <Shimmer className="h-5 w-3/4" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
