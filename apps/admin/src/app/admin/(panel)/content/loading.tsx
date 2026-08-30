export default function ContentLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <div className="sk-item h-8 w-32" />
        <div className="sk-item h-4 w-48" />
      </header>
      <div className="flex gap-2 border-b border-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="sk-item sk-circle h-10 w-24 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="sk-item h-5 w-32" />
            <div className="sk-item h-3.5 w-full" />
            <div className="sk-item h-3.5 w-3/4" />
            <div className="flex items-center gap-2 pt-2">
              <div className="sk-item sk-circle h-6 w-16" />
              <div className="sk-item sk-circle h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
