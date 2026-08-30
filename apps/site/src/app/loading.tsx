"use client";

import { Shimmer, ShimmerCard, ShimmerCircle, ShimmerImage } from "@/components/ui/Shimmer";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground overflow-hidden flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full min-h-[100svh] flex flex-col justify-end">
          <div className="max-w-3xl text-center sm:text-left mt-auto">
            <Shimmer className="h-8 w-44 rounded-full mb-5 mx-auto sm:mx-0 opacity-20" />
            <Shimmer className="h-16 sm:h-20 md:h-24 w-72 sm:w-96 mb-6 mx-auto sm:mx-0 opacity-20" />
            <Shimmer className="h-8 sm:h-10 md:h-12 w-60 sm:w-80 mb-8 mx-auto sm:mx-0 opacity-20" />
            <Shimmer className="h-5 sm:h-6 w-full max-w-md mb-10 mx-auto sm:mx-0 opacity-20" />
            <Shimmer className="h-12 w-52 rounded-full mx-auto sm:mx-0 opacity-20" />
          </div>
        </div>
      </section>

      {/* ── FeaturedOn ── */}
      <section className="py-8 md:py-12 border-b border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-8 sm:gap-14">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-6 sm:h-7 w-16 sm:w-24 rounded" />
          ))}
        </div>
      </section>

      {/* ── AboutMe ── */}
      <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <ShimmerImage className="w-full aspect-square" />
            </div>
            <div className="lg:col-span-7 order-3 lg:order-2 space-y-5">
              <Shimmer className="h-5 w-28 rounded-full" />
              <Shimmer className="h-9 w-3/4" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-5/6" />
              <Shimmer className="h-4 w-2/3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Shimmer className="h-7 w-16" />
                    <Shimmer className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TopicsGrid ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Shimmer className="h-8 w-48 mx-auto" />
          <div className="mt-12 md:mt-20 flex flex-wrap justify-center gap-3 sm:gap-6 py-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Shimmer key={i} className="h-[140px] w-[140px] sm:h-[220px] sm:w-[280px] rounded-xl shrink-0" />
            ))}
          </div>
        </div>
      </section>

      {/* ── MindUp ── */}
      <section className="relative overflow-hidden bg-[#FAF9F6] py-16 md:py-24 border-b border-[#e2e8f0]/40">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24">
          <div className="flex-1 space-y-5">
            <Shimmer className="h-5 w-28 rounded-full" />
            <Shimmer className="h-9 w-64" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-4/5" />
          </div>
          <ShimmerCircle className="w-56 h-56 sm:w-64 sm:h-64 lg:max-w-[480px] lg:max-h-[480px] shrink-0" />
        </div>
      </section>

      {/* ── MindUpBook (carousel) ── */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-20">
            <div className="w-full md:w-2/5 shrink-0">
              <ShimmerCard className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[300px] aspect-[2/3] mx-auto" />
            </div>
            <div className="w-full md:flex-1 space-y-4">
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-8 w-64" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-5/6" />
              <Shimmer className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </section>

      {/* ── BlogPreview ── */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="mt-3 h-8 sm:h-9 w-48" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden bg-card flex flex-col">
                <ShimmerImage className="aspect-[4/3] rounded-none" />
                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <Shimmer className="h-3 w-16 rounded-full" />
                  <Shimmer className="h-5 w-full" />
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-4 w-2/3" />
                  <Shimmer className="h-3 w-24 mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 md:py-24 border-b border-border bg-card/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <Shimmer className="h-5 w-28 rounded-full mx-auto" />
            <Shimmer className="mt-3 h-8 sm:h-9 w-52 mx-auto" />
          </div>
          <div className="mt-12 flex items-center gap-3">
            <Shimmer className="shrink-0 h-10 w-10 rounded-full" />
            <div className="flex-1 min-w-0 rounded-2xl border border-border bg-card p-8 sm:p-12 text-center space-y-4">
              <Shimmer className="w-10 h-10 rounded-lg mx-auto" />
              <Shimmer className="h-5 w-full max-w-lg mx-auto" />
              <Shimmer className="h-5 w-3/4 max-w-md mx-auto" />
              <Shimmer className="h-4 w-32 mx-auto rounded-full mt-6" />
              <Shimmer className="h-3 w-24 mx-auto rounded-full" />
            </div>
            <Shimmer className="shrink-0 h-10 w-10 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── MentorshipCta ── */}
      <section className="py-16 md:py-24 border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <Shimmer className="h-5 w-32 rounded-full mx-auto" />
            <Shimmer className="h-8 sm:h-9 w-72 mx-auto" />
            <Shimmer className="h-4 w-full max-w-md mx-auto" />
            <Shimmer className="h-4 w-3/4 max-w-sm mx-auto" />
            <Shimmer className="h-12 w-36 rounded-full mx-auto mt-4" />
          </div>
        </div>
      </section>

      {/* ── NewsletterCta ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <ShimmerImage className="w-full aspect-[16/10] rounded-none rounded-t-xl" />
            <div className="px-6 sm:px-12 pt-8 pb-10 sm:pt-10 sm:pb-12 text-center space-y-3">
              <Shimmer className="h-5 w-28 rounded-full mx-auto" />
              <Shimmer className="h-8 w-64 mx-auto" />
              <Shimmer className="h-4 w-80 max-w-full mx-auto" />
              <Shimmer className="h-4 w-64 mx-auto" />
              <Shimmer className="h-12 w-full max-w-md rounded-full mx-auto mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SagarGallery ── */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ShimmerImage className="w-full aspect-[4/3] rounded-2xl" />
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <Shimmer className="h-7 w-64 mx-auto" />
            <Shimmer className="h-4 w-56 mx-auto" />
            <Shimmer className="h-10 w-36 rounded-full mx-auto mt-1" />
          </div>
        </div>
      </section>
    </div>
  );
}
