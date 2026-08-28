import { Shimmer, ShimmerCard } from "@/components/ui/Shimmer";

export default function BooksLoading() {
  return (
    <div className="overflow-x-clip">
      {/* Hero Section */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 items-center lg:grid-cols-12 gap-10 lg:gap-20">
            {/* Image Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md aspect-[3/4] rounded-xl bg-gray-100" />
            </div>
            {/* Text Column */}
            <div className="lg:col-span-7 flex flex-col">
              <Shimmer className="h-5 w-32 rounded-full" />
              <div className="mt-4 space-y-2">
                <Shimmer className="h-10 w-full md:h-12 md:w-5/6" />
                <Shimmer className="h-10 w-3/4 md:h-12 md:w-2/3" />
              </div>
              <Shimmer className="mt-6 h-4 w-full max-w-lg" />
              <Shimmer className="mt-2 h-4 w-4/5 max-w-lg" />
              <Shimmer className="mt-2 h-4 w-3/5 max-w-lg" />
              <div className="mt-6">
                <Shimmer className="h-5 w-36" />
                <Shimmer className="mt-1 h-3 w-28" />
              </div>
              {/* Metrics */}
              <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-gray-200/60 bg-gray-50/40 p-5 sm:p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center text-center px-2 py-2">
                    <Shimmer className="h-8 w-8 rounded-lg" />
                    <Shimmer className="mt-3 h-6 w-16" />
                    <Shimmer className="mt-1.5 h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Library Section */}
      <section className="border-b border-gray-200 bg-gray-50/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="mt-3 h-8 w-48 md:h-10 md:w-56" />
            </div>
            <Shimmer className="h-4 w-20" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <ShimmerCard className="aspect-[3/4] w-full max-w-[260px]" />
                <Shimmer className="mt-5 h-3 w-20 rounded-full" />
                <Shimmer className="mt-2 h-5 w-40" />
                <Shimmer className="mt-2 h-3 w-56 max-w-full" />
                <Shimmer className="mt-4 h-8 w-32 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colophon Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-24">
          <Shimmer className="h-5 w-16 mx-auto rounded-full" />
          <div className="mt-5 space-y-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-4/5 mx-auto" />
          </div>
          <Shimmer className="mt-8 h-4 w-48 mx-auto rounded-full" />
        </div>
      </section>
    </div>
  );
}
