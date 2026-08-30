"use client";

import { SkeletonHeader, SkeletonCardGrid } from "@/components/ui/Shimmer";

export default function EbooksLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={96} titleW={224} subtitleW={320} />
        </div>
      </header>
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SkeletonCardGrid count={4} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" aspect="aspect-[2/3]" />
        </div>
      </section>
    </div>
  );
}
