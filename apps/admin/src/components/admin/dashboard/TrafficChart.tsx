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
  return d
    .toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    .toUpperCase();
}

export function TrafficChart({ initial }: { initial: GaResult }) {
  const [days, setDays] = useState<number>(14);
  const [result, setResult] = useState<GaResult>(initial);
  const [loadedDays, setLoadedDays] = useState<number>(14);
  const loading = days !== loadedDays;

  useEffect(() => {
    if (days === loadedDays) return;
    let cancelled = false;
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResult(data as GaResult);
          setLoadedDays(days);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadedDays(days);
      });
    return () => {
      cancelled = true;
    };
  }, [days, loadedDays]);

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

  const labelEvery = Math.max(1, Math.ceil(data?.daily.length ? data.daily.length / 6 : 6));

  return (
    <div className="rounded-2xl border border-border bg-card card-grad p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Traffic</h2>
          <p className="text-xs text-muted-foreground">
            Sessions vs pageviews
          </p>
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
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid h-[220px] place-items-center text-sm text-muted-foreground">
          Loading…
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
              viewBox="0 0 600 190"
              className="w-full"
              role="img"
              aria-label="Traffic chart"
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
                  <line
                    x1="0"
                    x2="600"
                    y1={g.y}
                    y2={g.y}
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="2"
                    y={g.y - 4}
                    fontSize="9"
                    fill="var(--muted-foreground)"
                  >
                    {g.label}
                  </text>
                </g>
              ))}
              {pGeo.area && (
                <path d={pGeo.area} fill="url(#ga-pageviews)" />
              )}
              {sGeo.area && <path d={sGeo.area} fill="url(#ga-sessions)" />}
              {pGeo.line && (
                <path
                  d={pGeo.line}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                />
              )}
              {sGeo.line && (
                <path
                  d={sGeo.line}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
              )}
              {data.daily.map((d, i) =>
                i % labelEvery === 0 ? (
                  <text
                    key={d.date}
                    x={(i * 600) / Math.max(1, data.daily.length - 1)}
                    y="186"
                    fontSize="9"
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
