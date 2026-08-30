"use client";

import { SkeletonHeader, SkeletonCardGrid } from "@/components/ui/Shimmer";

export default function ContentLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={96} titleW={224} subtitleW={320} />
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aspect="aspect-video" />
      </div>
    </div>
  );
}
