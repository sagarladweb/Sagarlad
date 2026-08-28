import { Shimmer, ShimmerCard } from "@/components/ui/Shimmer";

export default function BooksLoading() {
  return (
    <div className="overflow-x-clip">
      {/* Library Section */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
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
      <section className="bg-background">
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
