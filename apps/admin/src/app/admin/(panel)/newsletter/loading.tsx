export default function NewsletterLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="sk-item h-8 w-40" />
          <div className="sk-item mt-2 h-4 w-56" />
        </div>
        <div className="sk-item sk-circle h-10 w-32" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="sk-item h-9 w-9 shrink-0 rounded-lg" />
            <div className="space-y-1.5">
              <div className="sk-item h-6 w-12" />
              <div className="sk-item h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="sk-item mb-3 h-3 w-32" />
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <div className="sk-item h-4 w-4 shrink-0 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="sk-item h-4 w-48" />
                <div className="sk-item h-3 w-24" />
              </div>
              <div className="sk-item h-5 w-16 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
