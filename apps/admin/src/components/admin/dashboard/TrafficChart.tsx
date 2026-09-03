"use client";

import { useEffect, useState } from "react";
import type { GaResult } from "@/lib/analytics";
import { chartGeometry, formatCompact } from "@/lib/charts";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "28D", days: 28 },
  { label: "ALL", days: 90 },
] as const;

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function TrafficChart({ initial }: { initial: GaResult }) {
  const [days, setDays] = useState<number>(initial.data?.days ?? 14);
  const [result, setResult] = useState<GaResult>(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResult(data as GaResult);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [days]);

  const data = result.ok ? result.data : null;
  const sessions = data?.daily.map((d) => d.sessions) ?? [];
  const pageviews = data?.daily.map((d) => d.pageviews) ?? [];

  const sGeo = chartGeometry(sessions, 600, 180);
  const pGeo = chartGeometry(pageviews, 600, 180);
  const gridMax = Math.max(sGeo.max, pGeo.max);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: 10 + f * 160,
    label: formatCompact(Math.round(gridMax * (1 - f))),
  }));

  const dailyLen = data?.daily.length ?? 0;
  const labelEvery = Math.max(1, Math.ceil(dailyLen / 7));

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Traffic</h2>
          <p className="text-xs text-muted-foreground">Sessions vs pageviews</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                days === r.days
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          <div className="flex gap-4 text-xs">
            <div className="h-3 w-16 sk-item rounded-full" />
            <div className="h-3 w-16 sk-item rounded-full" />
          </div>
          <div className="h-[200px] w-full sk-item rounded-xl" />
          <div className="flex justify-between">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-3 w-10 sk-item rounded" />
            ))}
          </div>
        </div>
      ) : !data ? (
        <div className="mt-6 grid h-[220px] place-items-center text-center text-sm text-muted-foreground">
          No analytics data yet.
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Sessions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Pageviews
            </span>
          </div>
          <div className="mt-2">
            <svg
              viewBox="0 0 600 210"
              className="w-full"
              role="img"
              aria-label="Traffic chart"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="ga-sessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ga-pageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {gridLines.map((g) => (
                <g key={g.y}>
                  <line x1="0" x2="600" y1={g.y} y2={g.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="2" y={g.y - 4} fontSize="9" fill="var(--muted-foreground)">{g.label}</text>
                </g>
              ))}
              {pGeo.area && <path d={pGeo.area} fill="url(#ga-pageviews)" />}
              {sGeo.area && <path d={sGeo.area} fill="url(#ga-sessions)" />}
              {pGeo.line && <path d={pGeo.line} fill="none" stroke="#0ea5e9" strokeWidth="1.5" />}
              {sGeo.line && <path d={sGeo.line} fill="none" stroke="var(--accent)" strokeWidth="2" />}
              {data.daily.map((d, i) =>
                i % labelEvery === 0 || i === dailyLen - 1 ? (
                  <text
                    key={d.date}
                    x={(i * 600) / Math.max(1, dailyLen - 1)}
                    y="205"
                    fontSize="8"
                    fill="var(--muted-foreground)"
                    textAnchor="middle"
                  >
                    {shortDate(d.date)}
                  </text>
                ) : null
              )}
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
