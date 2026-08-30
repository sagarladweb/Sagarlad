export default function ModerationLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <div className="sk-item h-8 w-40" />
        <div className="sk-item h-4 w-56" />
      </header>
      <div className="flex gap-2 border-b border-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="sk-item sk-circle h-10 w-24 shrink-0" />
        ))}
      </div>
      <div className="divide-y divide-border border-y border-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="py-4 flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="sk-item h-3.5 w-48" />
              <div className="sk-item h-3 w-72" />
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="sk-item sk-circle h-8 w-8" />
              <div className="sk-item sk-circle h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
