import { Shimmer, ShimmerCard } from "@/components/ui/Shimmer";

export default function VideosLoading() {
  return (
    <div className="overflow-x-clip">
      {/* PageHeader */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="mt-3 h-10 w-64 md:h-12 md:w-80" />
          <Shimmer className="mt-4 h-5 w-96 max-w-full" />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-16">
        {/* Videos Section */}
        <section>
          <Shimmer className="h-6 w-48" />
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerCard key={i} className="aspect-video" />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <div className="rounded-xl bg-gray-900 p-8 sm:p-12 text-center">
          <Shimmer className="h-8 w-72 mx-auto rounded-sm bg-white/10" />
          <Shimmer className="mt-3 h-4 w-80 max-w-full mx-auto rounded-sm bg-white/10" />
          <div className="mt-6 flex justify-center gap-3">
            <Shimmer className="h-10 w-36 rounded-full bg-white/10" />
            <Shimmer className="h-10 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
