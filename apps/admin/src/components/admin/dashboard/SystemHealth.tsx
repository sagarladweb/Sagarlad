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
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Zap,
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
  "Database": Database,
  "Website": Globe,
  "Shared Data": Link2,
  "Brevo (Email)": Mail,
  "Google Analytics": BarChart3,
  "Supabase Storage": HardDrive,
  "Environment": Settings,
};

const STATUS_STYLE: Record<HealthStatus, { icon: typeof CheckCircle2; color: string; bg: string; border: string; badge: string; badgeBg: string }> = {
  ok: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/5",
    border: "border-l-emerald-500",
    badge: "text-emerald-700 dark:text-emerald-300",
    badgeBg: "bg-emerald-500/15",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/5",
    border: "border-l-amber-500",
    badge: "text-amber-700 dark:text-amber-300",
    badgeBg: "bg-amber-500/15",
  },
  error: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/5",
    border: "border-l-red-500",
    badge: "text-red-700 dark:text-red-300",
    badgeBg: "bg-red-500/15",
  },
};

const BADGE_LABEL: Record<HealthStatus, string> = {
  ok: "Connected",
  warn: "Not Configured",
  error: "Disconnected",
};

export function SystemHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return;
      }
      const json: HealthResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const okCount = data?.checks.filter((c) => c.status === "ok").length ?? 0;
  const totalCount = data?.checks.length ?? 0;
  const overallStyle = data ? STATUS_STYLE[data.status] : null;

  return (
    <div className="space-y-3">
      {/* Overall status banner */}
      <div
        className={`flex items-center justify-between rounded-xl px-3 py-2.5 border-l-4 transition-all duration-300 ${
          data
            ? `${overallStyle!.bg} ${overallStyle!.border}`
            : "bg-muted/50 border-l-muted-foreground/30"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {data ? (
            (() => {
              const SIcon = overallStyle!.icon;
              return <SIcon className={`w-5 h-5 ${overallStyle!.color}`} />;
            })()
          ) : (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          )}
          <div>
            <span className="text-sm font-bold">
              {data ? (
                <span className={overallStyle!.color}>
                  {data.status === "ok" ? "All Systems Operational" : data.status === "warn" ? "Partial Degradation" : "Issues Detected"}
                </span>
              ) : (
                "Checking..."
              )}
            </span>
            {data && (
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {okCount}/{totalCount} services connected
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 disabled:opacity-50 active:scale-95"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Check list */}
      {data && (
        <div className="space-y-1">
          {data.checks.map((check) => {
            const ServiceIcon = CHECK_ICONS[check.label] ?? Settings;
            const style = STATUS_STYLE[check.status];
            const StatusIcon = style.icon;
            return (
              <div
                key={check.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border-l-3 transition-all duration-150 ${style.bg} ${style.border} hover:brightness-95 dark:hover:brightness-110`}
              >
                {/* Service icon */}
                <div className={`shrink-0 grid h-8 w-8 place-items-center rounded-lg ${style.badgeBg}`}>
                  <ServiceIcon className={`w-4 h-4 ${style.color}`} />
                </div>

                {/* Label + message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{check.label}</span>
                    {check.latencyMs !== undefined && (
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {check.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {check.message}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badgeBg} ${style.badge}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {BADGE_LABEL[check.status]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Timestamp */}
      {data && (
        <p className="text-[10px] text-muted-foreground text-right tabular-nums">
          Last checked: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
