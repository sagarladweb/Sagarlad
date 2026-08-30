export default function SettingsLoading() {
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
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="sk-item h-3.5 w-24" />
            <div className="sk-item sk-card h-10 w-full" />
          </div>
        ))}
        <div className="sk-item sk-circle h-10 w-28" />
      </div>
    </div>
  );
}
