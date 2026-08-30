"use client";

import { Shimmer, ShimmerCard, ShimmerCircle, ShimmerImage } from "@/components/ui/Shimmer";

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden border-b border-border bg-background">
        <div className="relative z-20 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-6 pt-8 pb-10 sm:pt-14 sm:pb-16">
          <div className="lg:col-span-5 relative flex justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[340px]">
              <ShimmerImage className="w-full aspect-[3/4]" />
            </div>
          </div>
          <div className="lg:col-span-7 lg:pl-6 text-center lg:text-left order-3 lg:order-2 space-y-4">
            <Shimmer className="h-6 w-36 rounded-full mx-auto lg:mx-0" />
            <Shimmer className="h-12 sm:h-14 lg:h-16 w-64 mx-auto lg:mx-0" />
            <Shimmer className="h-4 w-full max-w-md mx-auto lg:mx-0" />
            <Shimmer className="h-4 w-3/4 max-w-sm mx-auto lg:mx-0" />
            <div className="space-y-3.5 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                  <Shimmer className="h-9 w-9 rounded-md shrink-0" />
                  <Shimmer className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Form + Sidebar ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start">
          {/* Form */}
          <div>
            <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm space-y-5">
              <Shimmer className="h-7 w-40" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Shimmer className="h-3.5 w-16" />
                    <Shimmer className="h-12 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Shimmer className="h-3.5 w-20" />
                  <Shimmer className="h-12 w-full rounded-xl" />
                </div>
              ))}
              <div className="space-y-2">
                <Shimmer className="h-3.5 w-16" />
                <Shimmer className="h-28 w-full rounded-xl" />
              </div>
              <Shimmer className="h-12 w-full rounded-full" />
            </div>
          </div>
          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border bg-card p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="h-9 w-9 rounded-md shrink-0" />
                  <div className="space-y-1.5">
                    <Shimmer className="h-3.5 w-24" />
                    <Shimmer className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border bg-card p-5 space-y-2.5">
              <Shimmer className="h-4 w-28" />
              {[1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="h-3.5 w-full" />
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
