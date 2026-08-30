"use client";

import { SkeletonHeader, SkeletonCardGrid } from "@/components/ui/Shimmer";

export default function BooksLoading() {
  return (
    <div className="min-h-screen bg-background">
      <section className="pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <SkeletonHeader eyebrowW={112} titleW={192} subtitleW={144} />
            <div className="sk-item sk-circle h-9 w-36" />
          </div>
          <SkeletonCardGrid count={6} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" imageOnly />
        </div>
      </section>
      <section className="py-16 md:py-24 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="sk-item h-7 w-48 mx-auto" />
          <div className="sk-item h-4 w-80 max-w-full mx-auto" />
          <div className="sk-item h-4 w-64 mx-auto" />
        </div>
      </section>
    </div>
  );
}
