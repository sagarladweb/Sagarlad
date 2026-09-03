"use client";

import { useState } from "react";
import { chartGeometry, formatCompact } from "@/lib/charts";
import { Settings2, X } from "lucide-react";

type Daily = { date: string; sessions: number; pageviews: number };
type Country = { country: string; users: number; sessions: number };

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
      />
    </div>
  );
}

export function ChartSandbox({
  daily,
  countries,
}: {
  daily: Daily[];
  countries: Country[];
}) {
  const [open, setOpen] = useState(false);

  // Traffic chart params
  const [svgW, setSvgW] = useState(800);
  const [svgH, setSvgH] = useState(300);
  const [padTop, setPadTop] = useState(20);
  const [padBottom, setPadBottom] = useState(50);
  const [labelYOffset, setLabelYOffset] = useState(10);
  const [labelSize, setLabelSize] = useState(10);
  const [gridSize, setGridSize] = useState(10);
  const [lineWidth, setLineWidth] = useState(2.5);
  const [labelEveryN, setLabelEveryN] = useState(0);

  // Country bar params
  const [countryH, setCountryH] = useState(220);
  const [barMaxW, setBarMaxW] = useState(60);
  const [barGap, setBarGap] = useState(6);
  const [valSize, setValSize] = useState(10);
  const [countryLabelSize, setCountryLabelSize] = useState(9);

  const chartH = svgH - padTop - padBottom;
  const labelY = svgH - labelYOffset;

  const sessions = daily.map((d) => d.sessions);
  const pageviews = daily.map((d) => d.pageviews);
  const sGeo = chartGeometry(sessions, svgW, chartH);
  const pGeo = chartGeometry(pageviews, svgW, chartH);
  const gridMax = Math.max(sGeo.max, pGeo.max);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: padTop + f * chartH,
    label: formatCompact(Math.round(gridMax * (1 - f))),
  }));

  const dailyLen = daily.length;
  const labelEvery = labelEveryN === 0 ? Math.max(1, Math.ceil(dailyLen / 7)) : labelEveryN;

  // Country bar calculations
  const cPadTop = 20;
  const cPadBottom = 40;
  const cChartH = countryH - cPadTop - cPadBottom;
  const maxUsers = Math.max(...countries.map((c) => c.users), 1);

  const output = `// TrafficChart
const W = ${svgW};
const H = ${svgH};
const PAD_TOP = ${padTop};
const PAD_BOTTOM = ${padBottom};
const CHART_H = H - PAD_TOP - PAD_BOTTOM; // ${chartH}
const LABEL_Y = H - ${labelYOffset}; // ${labelY}
const LABEL_SIZE = ${labelSize};
const GRID_LABEL_SIZE = ${gridSize};
const LINE_WIDTH = ${lineWidth};
const LABEL_EVERY_N = ${labelEveryN}; // ${labelEveryN === 0 ? "auto" : "every " + labelEveryN + " days"}

// Country bars
const COUNTRY_H = ${countryH};
const BAR_MAX_W = ${barMaxW};
const BAR_GAP = ${barGap};
const VAL_FONT_SIZE = ${valSize};
const COUNTRY_LABEL_SIZE = ${countryLabelSize};`;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Chart Sandbox
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Chart preview — left side */}
      <div className="flex-1 overflow-auto bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Traffic Chart Preview</h2>
            <span className="text-xs text-muted-foreground font-mono">
              {svgW}×{svgH} · pad {padTop}/{padBottom} · label y={labelY}
            </span>
          </div>

          {/* Traffic chart */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-4 text-xs mb-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" /> Sessions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> Pageviews
              </span>
            </div>
            <div style={{ height: svgH }}>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                width={svgW}
                height={svgH}
                className="w-full block"
              >
                <defs>
                  <linearGradient id="sb-sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sb-pageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {gridLines.map((g) => (
                  <g key={g.y}>
                    <line x1="0" x2={svgW} y1={g.y} y2={g.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="4" y={g.y - 6} fontSize={gridSize} fill="var(--muted-foreground)">{g.label}</text>
                  </g>
                ))}
                {pGeo.area && <path d={pGeo.area} fill="url(#sb-pageviews)" />}
                {sGeo.area && <path d={sGeo.area} fill="url(#sb-sessions)" />}
                {pGeo.line && <path d={pGeo.line} fill="none" stroke="#0ea5e9" strokeWidth="1.5" />}
                {sGeo.line && <path d={sGeo.line} fill="none" stroke="var(--accent)" strokeWidth={lineWidth} />}
                {daily.map((d, i) =>
                  i % labelEvery === 0 || i === dailyLen - 1 ? (
                    <g key={d.date}>
                      <line
                        x1={(i * svgW) / Math.max(1, dailyLen - 1)}
                        y1={padTop}
                        x2={(i * svgW) / Math.max(1, dailyLen - 1)}
                        y2={padTop + chartH}
                        stroke="var(--border)"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                        opacity="0.3"
                      />
                      <text
                        x={(i * svgW) / Math.max(1, dailyLen - 1)}
                        y={labelY}
                        fontSize={labelSize}
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
          </div>

          {/* Country bars */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="font-display text-sm font-semibold mb-3">Country Bars Preview</h3>
            <div style={{ height: countryH }}>
              <svg
                viewBox={`0 0 ${svgW} ${countryH}`}
                width={svgW}
                height={countryH}
                className="w-full block"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                  const y = cPadTop + cChartH - f * cChartH;
                  const val = Math.round(maxUsers * f);
                  return (
                    <g key={f}>
                      <line x1="10" x2={svgW - 10} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="10" y={y - 5} fontSize="9" fill="var(--muted-foreground)">{val}</text>
                    </g>
                  );
                })}
                {countries.map((c, i) => {
                  const bW = Math.min(barMaxW, ((svgW - 20) - barGap * (countries.length - 1)) / countries.length);
                  const barH = (c.users / maxUsers) * cChartH;
                  const x = 10 + i * (bW + barGap) + ((svgW - 20) - countries.length * (bW + barGap) + barGap) / 2;
                  const y = cPadTop + cChartH - barH;
                  return (
                    <g key={c.country}>
                      <rect x={x} y={y} width={bW} height={barH} rx={4} fill="#6366f1" opacity="0.85" />
                      <text x={x + bW / 2} y={y - 5} fontSize={valSize} fontWeight="600" fill="var(--foreground)" textAnchor="middle">{c.users}</text>
                      <text x={x + bW / 2} y={countryH - 10} fontSize={countryLabelSize} fill="var(--muted-foreground)" textAnchor="middle">
                        {c.country.length > 8 ? c.country.slice(0, 7) + "…" : c.country}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controls — right sidebar */}
      <div className="w-80 border-l border-border bg-card overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sandbox Controls</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Traffic chart controls */}
        <div className="space-y-3 rounded-xl border border-border/50 bg-background p-4">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-widest">Traffic Chart</h3>
          <Slider label="SVG Width" value={svgW} min={400} max={1200} onChange={setSvgW} />
          <Slider label="SVG Height" value={svgH} min={200} max={500} onChange={setSvgH} />
          <Slider label="Pad Top" value={padTop} min={5} max={60} onChange={setPadTop} />
          <Slider label="Pad Bottom" value={padBottom} min={20} max={100} onChange={setPadBottom} />
          <Slider label="Label Y from bottom" value={labelYOffset} min={2} max={30} onChange={setLabelYOffset} />
          <Slider label="Label Font Size" value={labelSize} min={6} max={18} onChange={setLabelSize} />
          <Slider label="Grid Font Size" value={gridSize} min={6} max={16} onChange={setGridSize} />
          <Slider label="Line Width" value={lineWidth} min={1} max={5} step={0.5} onChange={setLineWidth} />
          <Slider label="Label Every N (0=auto)" value={labelEveryN} min={0} max={14} onChange={setLabelEveryN} />
        </div>

        {/* Country bar controls */}
        <div className="space-y-3 rounded-xl border border-border/50 bg-background p-4">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-widest">Country Bars</h3>
          <Slider label="SVG Height" value={countryH} min={150} max={400} onChange={setCountryH} />
          <Slider label="Bar Max Width" value={barMaxW} min={20} max={100} onChange={setBarMaxW} />
          <Slider label="Bar Gap" value={barGap} min={2} max={20} onChange={setBarGap} />
          <Slider label="Value Font Size" value={valSize} min={6} max={16} onChange={setValSize} />
          <Slider label="Country Label Size" value={countryLabelSize} min={6} max={14} onChange={setCountryLabelSize} />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-green-500 uppercase tracking-widest">Output Settings</h3>
          <pre className="rounded-xl border border-border/50 bg-background p-3 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap overflow-auto max-h-60">
            {output}
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(output)}
            className="w-full rounded-lg bg-accent py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            Copy Settings
          </button>
        </div>
      </div>
    </div>
  );
}
