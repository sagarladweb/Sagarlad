import { Shimmer, ShimmerCard } from "@/components/ui/Shimmer";

export default function BooksReadLoading() {
  return (
    <div className="overflow-x-clip">
      {/* PageHeader */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Shimmer className="h-5 w-24 rounded-full" />
          <Shimmer className="mt-3 h-10 w-64 md:h-12 md:w-80" />
          <Shimmer className="mt-4 h-5 w-96 max-w-full" />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <ShimmerCard className="aspect-[3/4] w-full max-w-[260px]" />
              <Shimmer className="mt-5 h-3 w-20 rounded-full" />
              <Shimmer className="mt-2 h-5 w-40" />
              <Shimmer className="mt-2 h-3 w-56 max-w-full" />
              <Shimmer className="mt-4 h-8 w-32 rounded-full" />
            </div>
          ))}
        </div>

        {/* Link to books written */}
        <div className="mt-12 flex justify-center">
          <Shimmer className="h-4 w-56 rounded-full" />
        </div>
      </div>
    </div>
  );
}
