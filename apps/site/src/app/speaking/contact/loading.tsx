"use client";

import { SkeletonHeader } from "@/components/ui/Shimmer";

export default function SpeakingContactLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={96} titleW={256} subtitleW={320} />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-20">
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <div className="sk-item h-7 w-40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="sk-item h-3.5 w-20" />
              <div className="sk-item sk-card h-12 w-full" />
            </div>
          ))}
          <div className="space-y-2">
            <div className="sk-item h-3.5 w-16" />
            <div className="sk-item sk-card h-28 w-full" />
          </div>
          <div className="sk-item sk-circle h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
