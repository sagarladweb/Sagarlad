export default function NewsletterComposeLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar skeleton */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2 bg-card/50 shrink-0">
        <div className="sk-item h-4 w-16" />
        <div className="h-4 w-px bg-border" />
        <div className="sk-item h-4 w-36" />
        <div className="ml-auto sk-item h-3 w-24" />
      </div>

      {/* 3-pane skeleton */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="w-64 shrink-0 border-r border-border bg-card/30 p-3 space-y-3">
          <div className="flex gap-2">
            <div className="sk-item h-8 flex-1 rounded" />
            <div className="sk-item h-8 flex-1 rounded" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <div className="sk-item h-8 w-8 shrink-0 rounded-md" />
              <div className="flex-1 space-y-1">
                <div className="sk-item h-3.5 w-20" />
                <div className="sk-item h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>

        {/* Center editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border px-4 py-3 bg-card/30">
            <div className="sk-item h-6 w-64" />
          </div>
          <div className="border-b border-border px-4 py-2 bg-card/30 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="sk-item h-6 w-16 rounded" />
            ))}
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-2">
              <div className="sk-item h-3 w-16" />
              <div className="sk-item h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="sk-item h-3 w-16" />
              <div className="sk-item h-40 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="sk-item h-3 w-20" />
                <div className="sk-item h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="sk-item h-3 w-20" />
                <div className="sk-item h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right preview */}
        <div className="w-80 shrink-0 border-l border-border bg-card/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="sk-item h-3 w-16" />
            <div className="sk-item h-6 w-24 rounded" />
          </div>
          <div className="sk-item h-[500px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
