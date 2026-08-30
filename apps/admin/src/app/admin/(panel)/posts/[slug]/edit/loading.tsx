export default function PostEditLoading() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="sk-item sk-circle h-9 w-9 shrink-0" />
        <div className="space-y-1.5">
          <div className="sk-item h-7 w-40" />
          <div className="sk-item h-4 w-56" />
        </div>
      </header>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <div className="sk-item h-3.5 w-20" />
          <div className="sk-item sk-card h-12 w-full" />
        </div>
        <div className="space-y-2">
          <div className="sk-item h-3.5 w-16" />
          <div className="sk-item sk-card h-64 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="sk-item h-3.5 w-20" />
            <div className="sk-item sk-card h-10 w-full" />
          </div>
          <div className="space-y-2">
            <div className="sk-item h-3.5 w-24" />
            <div className="sk-item sk-card h-10 w-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="sk-item sk-circle h-10 w-28" />
          <div className="sk-item sk-circle h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
