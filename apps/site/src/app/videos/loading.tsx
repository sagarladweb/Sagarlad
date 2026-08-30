"use client";

import { SkeletonHeader, SkeletonCardGrid } from "@/components/ui/Shimmer";

export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={64} titleW={192} subtitleW={288} />
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
        <div className="sk-item sk-circle h-5 w-24" />
      </div>
      <section className="py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aspect="aspect-video" />
        </div>
      </section>
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="sk-item sk-card h-48 sm:h-56 w-full" />
        </div>
      </section>
    </div>
  );
}
