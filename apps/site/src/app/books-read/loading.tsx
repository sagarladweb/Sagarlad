"use client";

import { Shimmer, ShimmerCard, ShimmerImage } from "@/components/ui/Shimmer";

export default function BooksReadLoading() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-foreground text-white pt-20 sm:pt-28 pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <Shimmer className="h-8 w-32 rounded-full opacity-20" />
            <Shimmer className="h-10 sm:h-12 w-64 opacity-20" />
            <Shimmer className="h-5 w-80 max-w-full opacity-20" />
          </div>
        </div>
      </section>

      {/* ── Book Grid ── */}
      <section className="py-10 sm:py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <ShimmerImage className="aspect-[2/3] rounded-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer link ── */}
      <div className="pb-16 text-center">
        <Shimmer className="h-4 w-48 mx-auto rounded-full" />
      </div>
    </div>
  );
}
