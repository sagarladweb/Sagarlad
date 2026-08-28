import { Shimmer, ShimmerCircle } from "@/components/ui/Shimmer";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 overflow-x-clip">
      {/* Profile Header */}
      <header className="pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          <ShimmerCircle className="h-28 w-28 sm:h-36 sm:w-36 shrink-0" />
          <div className="flex-1 text-center sm:text-left space-y-4">
            <Shimmer className="h-8 w-48 mx-auto sm:mx-0" />
            <Shimmer className="h-4 w-56 mx-auto sm:mx-0" />
            <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center sm:text-left">
                  <Shimmer className="h-5 w-12 mx-auto sm:mx-0" />
                  <Shimmer className="h-3 w-14 mt-1.5 mx-auto sm:mx-0" />
                </div>
              ))}
            </div>
            <Shimmer className="h-4 w-80 max-w-full mx-auto sm:mx-0" />
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              <Shimmer className="h-9 w-24 rounded-full" />
              <Shimmer className="h-9 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mt-10 border-t border-gray-200 flex items-stretch">
        <div className="flex flex-1 items-center justify-center gap-2 border-b-2 border-gray-900 px-4 py-3">
          <Shimmer className="h-4 w-12" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent px-4 py-3">
          <Shimmer className="h-4 w-14" />
        </div>
      </nav>

      {/* Search + Category Pills */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="order-2 lg:order-1 flex gap-2 overflow-hidden lg:flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>
        <Shimmer className="order-1 lg:order-2 h-9 w-full lg:w-60 rounded-full shrink-0" />
      </div>

      {/* Posts Grid — 3 cols on desktop */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-12">
              <Shimmer className="h-4 w-3/4 rounded-sm bg-white/20" />
              <Shimmer className="h-3 w-1/2 mt-1.5 rounded-sm bg-white/15" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <nav className="mt-12 flex items-center justify-center gap-3">
        <Shimmer className="h-9 w-20 rounded-full" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-9 w-16 rounded-full" />
      </nav>
    </div>
  );
}
