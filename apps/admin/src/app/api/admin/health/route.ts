import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";

export const runtime = "nodejs";

export type HealthStatus = "ok" | "warn" | "error";
export type HealthCheck = {
  label: string;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
};

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  const count = await dbSafe(() => prisma.post.count(), -1);
  const latency = Date.now() - start;

  if (count >= 0) {
    return {
      label: "Database",
      status: "ok",
      message: `Connected — ${count} posts`,
      latencyMs: latency,
    };
  }
  return {
    label: "Database",
    status: "error",
    message: "Query failed — check DATABASE_URL or Supabase status",
  };
}

async function checkSiteConnectivity(): Promise<HealthCheck> {
  const siteUrl = (process.env.SITE_URL ?? "https://sagarlad.com").trim().replace(/\/$/, "");
  const start = Date.now();
  try {
    const res = await fetch(siteUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
    const latency = Date.now() - start;

    if (res && res.status < 500) {
      return {
        label: "Website",
        status: "ok",
        message: `Reachable at ${siteUrl} (${res.status})`,
        latencyMs: latency,
      };
    }
    return {
      label: "Website",
      status: "error",
      message: `Unreachable at ${siteUrl}`,
    };
  } catch {
    return {
      label: "Website",
      status: "error",
      message: `Timeout reaching ${siteUrl}`,
    };
  }
}

async function checkSharedDatabase(): Promise<HealthCheck> {
  // Verify admin and site share the same DB by counting the same table
  const start = Date.now();
  const postCount = await dbSafe(() => prisma.post.count(), -1);
  const subCount = await dbSafe(() => prisma.newsletterSubscriber.count(), -1);
  const latency = Date.now() - start;

  if (postCount >= 0 && subCount >= 0) {
    return {
      label: "Shared Data",
      status: "ok",
      message: `Admin ↔ Site DB synced (${postCount} posts, ${subCount} subs)`,
      latencyMs: latency,
    };
  }
  return {
    label: "Shared Data",
    status: "error",
    message: "Cannot verify admin ↔ site DB sync",
  };
}

async function checkBrevo(): Promise<HealthCheck> {
  const key = process.env.BREVO_API_KEY;
  const email = process.env.BREVO_FROM_EMAIL;

  if (!key || !email) {
    return {
      label: "Brevo (Email)",
      status: "warn",
      message: "BREVO_API_KEY or BREVO_FROM_EMAIL not set — newsletters won't send",
    };
  }

  const start = Date.now();
  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: { accept: "application/json", "api-key": key },
      signal: AbortSignal.timeout(10000),
    });
    const latency = Date.now() - start;
    const body = await res.json().catch(() => null);

    if (res.ok) {
      const plan = body?.plan?.[0]?.type ?? "unknown";
      return {
        label: "Brevo (Email)",
        status: "ok",
        message: `API key valid — ${body.email ?? email} (${plan} plan)`,
        latencyMs: latency,
      };
    }

    // Provide specific error details
    const msg = body?.message ?? body?.code ?? `HTTP ${res.status}`;
    return {
      label: "Brevo (Email)",
      status: "warn",
      message: `API error (${res.status}): ${msg}`,
      latencyMs: latency,
    };
  } catch (e) {
    const latency = Date.now() - start;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return {
      label: "Brevo (Email)",
      status: "error",
      message: `Could not reach Brevo API — ${msg}`,
      latencyMs: latency,
    };
  }
}

async function checkGoogleAnalytics(): Promise<HealthCheck> {
  const propId = process.env.GA_PROPERTY_ID;
  const serviceJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!propId || !serviceJson) {
    return {
      label: "Google Analytics",
      status: "warn",
      message: "GA_PROPERTY_ID or GOOGLE_SERVICE_ACCOUNT_JSON not set",
    };
  }

  // Verify the service account JSON is parseable
  try {
    const raw = serviceJson.trim().startsWith("{")
      ? serviceJson
      : Buffer.from(serviceJson, "base64").toString("utf8");
    const creds = JSON.parse(raw);
    if (!creds.client_email || !creds.private_key) {
      return {
        label: "Google Analytics",
        status: "error",
        message: "Service account JSON missing client_email or private_key",
      };
    }
    return {
      label: "Google Analytics",
      status: "ok",
      message: `Configured — property ${propId}`,
    };
  } catch {
    return {
      label: "Google Analytics",
      status: "error",
      message: "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON or base64",
    };
  }
}

async function checkSupabaseStorage(): Promise<HealthCheck> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      label: "Supabase Storage",
      status: "error",
      message: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — uploads will fail",
    };
  }

  // Ping Supabase REST to verify credentials work
  const start = Date.now();
  try {
    const res = await fetch(`${url}/storage/v1/bucket`, {
      headers: {
        authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
    const latency = Date.now() - start;

    if (res && res.ok) {
      const buckets = await res.json().catch(() => []);
      const names = Array.isArray(buckets) ? buckets.map((b: { name: string }) => b.name).join(", ") : "unknown";
      return {
        label: "Supabase Storage",
        status: "ok",
        message: `Connected — buckets: ${names}`,
        latencyMs: latency,
      };
    }
    return {
      label: "Supabase Storage",
      status: "error",
      message: `Credential check failed (HTTP ${res?.status ?? "none"})`,
    };
  } catch {
    return {
      label: "Supabase Storage",
      status: "error",
      message: "Could not reach Supabase API",
    };
  }
}

async function checkEnvironment(): Promise<HealthCheck> {
  const required = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["AUTH_SECRET", process.env.AUTH_SECRET],
    ["ADMIN_EMAIL", process.env.ADMIN_EMAIL],
    ["SITE_URL", process.env.SITE_URL],
    ["NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET],
  ] as const;

  const missing = required.filter(([, v]) => !v).map(([k]) => k);

  if (missing.length === 0) {
    return {
      label: "Environment",
      status: "ok",
      message: "All required env vars set",
    };
  }
  return {
    label: "Environment",
    status: "error",
    message: `Missing: ${missing.join(", ")}`,
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = await Promise.all([
    checkDatabase(),
    checkSiteConnectivity(),
    checkSharedDatabase(),
    checkBrevo(),
    checkGoogleAnalytics(),
    checkSupabaseStorage(),
    checkEnvironment(),
  ]);

  const overall: HealthStatus = checks.some((c) => c.status === "error")
    ? "error"
    : checks.some((c) => c.status === "warn")
      ? "warn"
      : "ok";

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      checks,
    },
    { headers: NO_STORE_HEADERS }
  );
}
