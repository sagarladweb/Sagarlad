"use client";

import { SkeletonHeader } from "@/components/ui/Shimmer";

export default function NewsletterLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={96} titleW={256} subtitleW={320} />
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="sk-item h-4 w-24 rounded-full" />
            <div className="sk-item h-5 w-full" />
            <div className="sk-item h-3.5 w-4/5" />
            <div className="sk-item h-3 w-32 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
