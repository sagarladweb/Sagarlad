"use client";

import { SkeletonHeader } from "@/components/ui/Shimmer";

export default function QuotesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={64} titleW={192} subtitleW={288} />
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="sk-item h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <div className="sk-item h-3.5 w-full" />
                <div className="sk-item h-3.5 w-4/5" />
              </div>
              <div className="sk-item h-3 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
