"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Database,
  Globe,
  Link2,
  Mail,
  BarChart3,
  HardDrive,
  Settings,
  RefreshCw,
  Loader2,
} from "lucide-react";

type HealthStatus = "ok" | "warn" | "error";
type HealthCheck = {
  label: string;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
};
type HealthResponse = {
  status: HealthStatus;
  timestamp: string;
  checks: HealthCheck[];
};

const CHECK_ICONS: Record<string, typeof Database> = {
  Database,
  Website: Globe,
  "Shared Data": Link2,
  "Brevo (Email)": Mail,
  "Google Analytics": BarChart3,
  "Supabase Storage": HardDrive,
  Environment: Settings,
};

const DOT_COLOR: Record<HealthStatus, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-red-500",
};

const PRIORITY: Record<HealthStatus, number> = {
  error: 0,
  warn: 1,
  ok: 2,
};

export function SystemHealthWidget() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const sorted = data?.checks
    ? [...data.checks].sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status])
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              data?.status === "ok" ? "bg-emerald-500" : data?.status === "warn" ? "bg-amber-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {data
              ? `${data.checks.filter((c) => c.status === "ok").length}/${data.checks.length} connected`
              : "Running checks…"}
          </span>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Refresh
        </button>
      </div>

      {/* Check rows */}
      {sorted.length > 0 ? (
        <ul className="space-y-1">
          {sorted.map((check) => {
            const Icon = CHECK_ICONS[check.label] ?? Settings;
            return (
              <li
                key={check.label}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${DOT_COLOR[check.status]}`}
                />
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{check.label}</span>
                    {check.latencyMs !== undefined && (
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {check.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {check.message}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : loading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : null}

      {/* Timestamp */}
      {data && (
        <p className="text-[10px] text-muted-foreground text-right tabular-nums">
          Last checked: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
