"use client";

import { SkeletonHeader } from "@/components/ui/Shimmer";

export default function PrivacyLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 md:py-20">
          <SkeletonHeader eyebrowW={80} titleW={192} subtitleW={320} />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16 space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-3">
            <div className="sk-item h-5 w-48" />
            <div className="sk-item h-3.5 w-full" />
            <div className="sk-item h-3.5 w-5/6" />
            <div className="sk-item h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
