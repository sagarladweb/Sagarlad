"use client";

import { Users, MousePointerClick, Eye, Timer } from "lucide-react";
import { KPICard } from "@/components/ui/Card";
import { HoverCard } from "@/components/admin/dashboard/HoverCard";
import { chartGeometry } from "@/lib/charts";

function Sparkline({ values }: { values: number[] }) {
  const { line, area } = chartGeometry(values, 120, 36);
  if (!line) return <div className="h-9" />;
  return (
    <svg viewBox="0 0 120 36" className="h-9 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill="url(#spark-fill)" />}
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  );
}

type KPI = {
  label: string;
  value: string;
  sub: string;
  tip?: string;
  icon: React.ComponentType<{ className?: string }>;
  values: number[];
  details?: React.ReactNode;
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function KPISection({
  totals,
  daily,
}: {
  totals: {
    users: number;
    sessions: number;
    pageviews: number;
    avgEngagement: number;
    engagementRate: number;
  };
  daily: { date: string; sessions: number; pageviews: number; avgEngagement: number }[];
}) {
  const kpis: KPI[] = [
    {
      label: "Visitors",
      value: totals.users.toLocaleString(),
      sub: "unique people",
      tip: "Distinct people who visited",
      icon: Users,
      values: daily.map((d) => d.sessions),
      details: (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">Daily unique visitors (last 14 days):</p>
          {daily.slice(-7).map((d) => (
            <div key={d.date} className="flex justify-between">
              <span className="text-muted-foreground">{d.date}</span>
              <span className="font-medium tabular-nums">{d.sessions}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Visits",
      value: totals.sessions.toLocaleString(),
      sub: "total sessions",
      tip: "Every visit to your site",
      icon: MousePointerClick,
      values: daily.map((d) => d.sessions),
      details: (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">Daily sessions (last 7 days):</p>
          {daily.slice(-7).map((d) => (
            <div key={d.date} className="flex justify-between">
              <span className="text-muted-foreground">{d.date}</span>
              <span className="font-medium tabular-nums">{d.sessions}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Page views",
      value: totals.pageviews.toLocaleString(),
      sub: "pages loaded",
      tip: "Pages people looked at",
      icon: Eye,
      values: daily.map((d) => d.pageviews),
      details: (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">Daily pageviews (last 7 days):</p>
          {daily.slice(-7).map((d) => (
            <div key={d.date} className="flex justify-between">
              <span className="text-muted-foreground">{d.date}</span>
              <span className="font-medium tabular-nums">{d.pageviews}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Avg. time",
      value: formatDuration(totals.avgEngagement),
      sub: "per visit",
      tip: "How long people stay",
      icon: Timer,
      values: daily.map((d) => d.avgEngagement),
      details: (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">Daily avg. engagement (last 7 days):</p>
          {daily.slice(-7).map((d) => (
            <div key={d.date} className="flex justify-between">
              <span className="text-muted-foreground">{d.date}</span>
              <span className="font-medium tabular-nums">{formatDuration(d.avgEngagement)}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Overview
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <HoverCard key={k.label} details={k.details}>
            <KPICard
              label={k.label}
              value={k.value}
              sub={k.sub}
              tip={k.tip}
              icon={k.icon}
              sparkline={<Sparkline values={k.values} />}
            />
          </HoverCard>
        ))}
      </div>
    </section>
  );
}
