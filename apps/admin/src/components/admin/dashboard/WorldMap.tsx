"use client";

type Country = { country: string; users: number; sessions: number };

export function WorldMap({ data }: { data: Country[] }) {
  const maxUsers = Math.max(...data.map((c) => c.users), 1);

  if (data.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-center text-sm text-muted-foreground">
        No location data yet. Configure GA_PROPERTY_ID to see visitor countries.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((c) => {
        const pct = Math.round((c.users / maxUsers) * 100);
        return (
          <div key={c.country} className="group">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{c.country}</span>
              <span className="tabular-nums text-muted-foreground">
                {c.users} users · {c.sessions} sessions
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
