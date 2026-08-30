"use client";

import { SkeletonCardGrid } from "@/components/ui/Shimmer";

export default function BooksReadLoading() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-foreground text-white pt-20 sm:pt-28 pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="sk-item sk-circle h-8 w-32 dark" />
            <div className="sk-item h-10 sm:h-12 w-64 dark" />
            <div className="sk-item h-5 w-80 max-w-full dark" />
          </div>
        </div>
      </section>
      <section className="py-10 sm:py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SkeletonCardGrid count={5} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-5" imageOnly />
        </div>
      </section>
      <div className="pb-16 text-center">
        <div className="sk-item sk-circle h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}
