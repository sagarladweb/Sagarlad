"use client";

import { Shimmer } from "@/components/ui/Shimmer";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative h-[100svh] bg-foreground flex flex-col items-center justify-end pb-20 px-6">
        <Shimmer className="h-5 w-36 rounded-full bg-white/10 mb-5" />
        <Shimmer className="h-11 w-72 max-w-full mb-3 bg-white/10" />
        <Shimmer className="h-6 w-56 max-w-full mb-8 bg-white/10" />
        <Shimmer className="h-11 w-32 rounded-full bg-accent/80" />
      </section>

      {/* ── FeaturedOn ── */}
      <section className="py-10 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-7 w-20 rounded" />
          ))}
        </div>
      </section>

      {/* ── AboutMe ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <Shimmer className="h-5 w-28 rounded-full" />
            <Shimmer className="h-9 w-3/4" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-5/6" />
            <Shimmer className="h-4 w-2/3" />
          </div>
          <Shimmer className="w-full md:w-72 aspect-square rounded-xl" />
        </div>
      </section>

      {/* ── TopicsGrid ── */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Shimmer key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* ── MindUp ── */}
      <section className="py-20 border-t border-border bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <Shimmer className="h-5 w-28 rounded-full" />
            <Shimmer className="h-9 w-64" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-4/5" />
          </div>
          <Shimmer className="w-64 h-64 rounded-full" />
        </div>
      </section>

      {/* ── BlogPreview ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Shimmer className="h-5 w-24 rounded-full" />
            <Shimmer className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <Shimmer className="aspect-square w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Shimmer className="h-4 w-3/4" />
                  <Shimmer className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <Shimmer className="h-5 w-28 rounded-full mx-auto" />
          <Shimmer className="h-8 w-56 mx-auto" />
          <div className="mt-10 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border p-6 space-y-3">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-5/6 mx-auto" />
                <Shimmer className="h-3 w-32 mx-auto rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NewsletterCta ── */}
      <section className="py-20 border-t border-border bg-foreground">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-4">
          <Shimmer className="h-8 w-64 mx-auto bg-white/10" />
          <Shimmer className="h-4 w-80 max-w-full mx-auto bg-white/10" />
          <div className="flex justify-center gap-3 mt-6">
            <Shimmer className="h-11 w-48 rounded-full bg-white/10" />
          </div>
        </div>
      </section>
    </div>
  );
}
