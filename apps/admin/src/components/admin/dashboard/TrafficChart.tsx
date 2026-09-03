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

const W = 800;
const H = 311;
const PAD_TOP = 29;
const PAD_BOTTOM = 48;
const CHART_H = H - PAD_TOP - PAD_BOTTOM; // 234
const LABEL_Y = H - 14 - 6; // 291
const LABEL_SIZE = 12;
const GRID_LABEL_SIZE = 12;
const LINE_WIDTH = 2.5;
const LABEL_X_PAD = 23;
const LABEL_EVERY_N: number = 1;

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

  const sGeo = chartGeometry(sessions, W, CHART_H);
  const pGeo = chartGeometry(pageviews, W, CHART_H);
  const gridMax = Math.max(sGeo.max, pGeo.max);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD_TOP + f * CHART_H,
    label: formatCompact(Math.round(gridMax * (1 - f))),
  }));

  const dailyLen = data?.daily.length ?? 0;
  const labelEvery = LABEL_EVERY_N === 0 ? Math.max(1, Math.ceil(dailyLen / 7)) : LABEL_EVERY_N;

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
          <div className="h-[300px] w-full sk-item rounded-xl" />
        </div>
      ) : !data ? (
        <div className="mt-6 grid h-[300px] place-items-center text-center text-sm text-muted-foreground">
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
          <div className="mt-3" style={{ height: H }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              className="w-full block"
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
                  <line x1="0" x2={W} y1={g.y} y2={g.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                  <text x="4" y={g.y - 6} fontSize={GRID_LABEL_SIZE} fill="var(--muted-foreground)">{g.label}</text>
                </g>
              ))}

              {pGeo.area && <path d={pGeo.area} fill="url(#ga-pageviews)" />}
              {sGeo.area && <path d={sGeo.area} fill="url(#ga-sessions)" />}
              {pGeo.line && <path d={pGeo.line} fill="none" stroke="#0ea5e9" strokeWidth="1.5" />}
              {sGeo.line && <path d={sGeo.line} fill="none" stroke="var(--accent)" strokeWidth={LINE_WIDTH} />}

              {data.daily.map((d, i) =>
                i % labelEvery === 0 || i === dailyLen - 1 ? (
                  <g key={d.date}>
                    <line
                      x1={LABEL_X_PAD + (i * (W - 2 * LABEL_X_PAD)) / Math.max(1, dailyLen - 1)}
                      y1={PAD_TOP}
                      x2={LABEL_X_PAD + (i * (W - 2 * LABEL_X_PAD)) / Math.max(1, dailyLen - 1)}
                      y2={PAD_TOP + CHART_H}
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      opacity="0.3"
                    />
                    <text
                      x={LABEL_X_PAD + (i * (W - 2 * LABEL_X_PAD)) / Math.max(1, dailyLen - 1)}
                      y={LABEL_Y}
                      fontSize={LABEL_SIZE}
                      fill="var(--muted-foreground)"
                      textAnchor="middle"
                    >
                      {shortDate(d.date)}
                    </text>
                  </g>
                ) : null
              )}
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
