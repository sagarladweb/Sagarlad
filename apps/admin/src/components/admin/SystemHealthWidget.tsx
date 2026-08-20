"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Database,
  Globe,
  HardDrive,
  ShieldCheck,
} from "lucide-react";

type HealthCheck = {
  ok: boolean;
  message: string;
  latencyMs?: number;
};

type HealthResponse = {
  status: "healthy" | "degraded";
  timestamp: string;
  checks: Record<string, HealthCheck>;
};

export function SystemHealthWidget() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/health");
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Health check failed");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run diagnostics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const iconForCheck = (key: string) => {
    switch (key) {
      case "database":
        return Database;
      case "siteConnectivity":
        return Globe;
      case "storage":
        return HardDrive;
      case "environment":
        return ShieldCheck;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card card-grad p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold">System Health & Diagnostics</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Live diagnostic audit for Supabase, Vercel, Site Webhooks & Environment setup.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Run Diagnostics
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
          {error}
        </div>
      ) : !data && loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running diagnostic pings...
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-xs">
            <span className="font-medium text-muted-foreground">Overall System Status:</span>
            <span
              className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider ${
                data.status === "healthy" ? "text-green-600" : "text-amber-600"
              }`}
            >
              {data.status === "healthy" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Healthy & Operational
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> Degraded / Setup Required
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(data.checks).map(([key, check]) => {
              const Icon = iconForCheck(key);
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      check.ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-xs font-bold capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      {check.latencyMs !== undefined && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {check.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {check.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="pt-2 text-right font-mono text-[10px] text-muted-foreground">
            Last checked: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ) : null}
    </div>
  );
}
