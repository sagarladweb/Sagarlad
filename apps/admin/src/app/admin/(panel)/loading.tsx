export default function PanelLoading() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="skeleton h-10 w-32 rounded-full" />
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="skeleton h-12 rounded-2xl border border-border"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
            <div className="skeleton mt-4 h-9 w-20" />
            <div className="skeleton mt-2 h-3 w-28" />
            <div className="skeleton mt-4 h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton mt-6 h-56 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="skeleton h-5 w-32" />
          <div className="mt-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-3 w-8" />
                </div>
                <div className="skeleton h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="skeleton h-5 w-28" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="space-y-3 p-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}