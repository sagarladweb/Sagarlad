export default function PanelLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-muted" />
          <div className="h-4 w-72 rounded-lg bg-muted/60" />
        </div>
        <div className="h-10 w-32 rounded-2xl bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-3xl border border-border/60 bg-card p-6" />
        ))}
      </div>

      <div className="h-96 rounded-3xl border border-border/60 bg-card p-6" />
    </div>
  );
}
