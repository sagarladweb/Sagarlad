export default function NewsletterLoading() {
  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <div className="sk-item h-8 w-40" />
        <div className="sk-item mt-2 h-4 w-56" />
      </header>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="sk-item h-5 w-32" />
          <div className="sk-item sk-circle h-10 w-28" />
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="sk-item h-4 flex-1" />
                <div className="sk-item h-4 w-32 shrink-0" />
                <div className="sk-item sk-circle h-6 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
