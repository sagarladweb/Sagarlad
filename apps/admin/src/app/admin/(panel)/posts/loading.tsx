export default function PostsLoading() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="sk-item h-8 w-40" />
          <div className="sk-item h-4 w-56" />
        </div>
        <div className="sk-item sk-circle h-10 w-28" />
      </header>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="sk-item sk-circle h-10 w-full" />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sk-item sk-circle h-8 w-20" />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <div className="p-5 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="sk-item h-4 flex-1" />
              <div className="sk-item h-4 w-24 shrink-0" />
              <div className="sk-item sk-circle h-6 w-16 shrink-0" />
              <div className="sk-item h-4 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="sk-item sk-circle h-9 w-9" />
        ))}
      </div>
    </div>
  );
}
