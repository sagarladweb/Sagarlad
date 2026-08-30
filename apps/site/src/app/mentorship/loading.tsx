"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function MentorshipLoading() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-background pt-20 sm:pt-28 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-6 w-32 rounded-full mx-auto" />
          <Shimmer className="h-10 sm:h-12 w-72 mx-auto" />
          <Shimmer className="h-4 w-full max-w-md mx-auto" />
          <Shimmer className="h-4 w-3/4 max-w-sm mx-auto" />
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12">
            <Shimmer className="h-8 w-64 mx-auto" />
            <Shimmer className="h-4 w-80 max-w-full mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <Shimmer className="h-12 w-12 rounded-xl" />
                <Shimmer className="h-5 w-32" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12">
            <Shimmer className="h-8 w-48 mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-3/4 mt-2" />
                <div className="flex items-center gap-3 mt-4">
                  <Shimmer className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Shimmer className="h-3.5 w-24" />
                    <Shimmer className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-8 w-56 mx-auto" />
          <Shimmer className="h-4 w-full max-w-md mx-auto" />
          <Shimmer className="h-12 w-36 rounded-full mx-auto mt-4" />
        </div>
      </section>
    </div>
  );
}
