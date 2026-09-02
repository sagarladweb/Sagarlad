export default function AnnouncementLoading() {
  return (
    <section className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground text-background overflow-hidden">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />

      {/* Content — same layout as the real page, skeleton bars */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-3xl text-center sm:text-left mt-auto">
          {/* Eyebrow skeleton */}
          <div className="mb-4 flex justify-center sm:justify-start">
            <div className="h-7 w-48 rounded-full bg-white/10 animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="mb-6 space-y-3">
            <div className="h-12 sm:h-16 w-full rounded-lg bg-white/10 animate-pulse" />
            <div className="h-12 sm:h-16 w-3/4 rounded-lg bg-white/10 animate-pulse" />
          </div>

          {/* Description skeleton */}
          <div className="mb-10 space-y-2 max-w-xl">
            <div className="h-5 w-full rounded bg-white/10 animate-pulse" />
            <div className="h-5 w-5/6 rounded bg-white/10 animate-pulse" />
            <div className="h-5 w-2/3 rounded bg-white/10 animate-pulse" />
          </div>

          {/* CTA skeleton */}
          <div className="h-12 w-48 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
