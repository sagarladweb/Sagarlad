"use client";

import { SkeletonHeader } from "@/components/ui/Shimmer";

export default function SocialsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={64} titleW={192} subtitleW={288} />
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="sk-item sk-circle h-12 w-12 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="sk-item h-4 w-24" />
                <div className="sk-item h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
