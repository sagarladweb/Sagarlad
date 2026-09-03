"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Database,
  Globe,
  Link2,
  Mail,
  BarChart3,
  HardDrive,
  Settings,
  ArrowRight,
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

export function SystemHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const sorted = data?.checks
    ? [...data.checks].sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status])
    : [];
  const shown = sorted.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Status header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            data?.status === "ok" ? "bg-emerald-500" : data?.status === "warn" ? "bg-amber-500" : "bg-red-500"
          }`}
        />
        {data
          ? `${data.checks.filter((c) => c.status === "ok").length}/${data.checks.length} connected`
          : "Checking…"}
      </div>

      {/* Check rows */}
      {shown.length > 0 ? (
        <ul className="space-y-1">
          {shown.map((check) => {
            const Icon = CHECK_ICONS[check.label] ?? Settings;
            return (
              <li
                key={check.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors"
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${DOT_COLOR[check.status]}`}
                />
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium truncate flex-1">
                  {check.label}
                </span>
                {check.latencyMs !== undefined && (
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {check.latencyMs}ms
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : data ? (
        <p className="text-xs text-muted-foreground">No checks available.</p>
      ) : (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* View all link */}
      <Link
        href="/admin/settings#health"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        View all checks <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
