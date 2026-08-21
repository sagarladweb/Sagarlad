import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; message: string; latencyMs?: number }> = {};

  // 1. Database Ping (Supabase PostgreSQL via Prisma)
  const dbStart = Date.now();
  const postCount = await dbSafe(() => prisma.post.count(), -1);
  const dbLatency = Date.now() - dbStart;
  if (postCount >= 0) {
    checks.database = {
      ok: true,
      message: `Database connected. ${postCount} posts total.`,
      latencyMs: dbLatency,
    };
  } else {
    checks.database = {
      ok: false,
      message: "Database query failed or auto-paused. Check DATABASE_URL and Supabase status.",
    };
  }

  // 2. Environment Variables Audit (no secrets or names exposed)
  const envVars = [
    process.env.DATABASE_URL,
    process.env.AUTH_SECRET,
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD,
    process.env.CRON_SECRET,
    process.env.SITE_URL,
  ];
  const envOk = envVars.every(Boolean);

  checks.environment = {
    ok: envOk,
    message: envOk
      ? "All required production environment variables are configured."
      : "One or more required environment variables are missing.",
  };

  // 3. Site Connectivity & ISR Revalidation Ping
  const siteUrl = (process.env.SITE_URL ?? "https://sagarlad.com").trim().replace(/\/$/, "");
  const siteStart = Date.now();
  try {
    const siteRes = await fetch(siteUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);
    const siteLatency = Date.now() - siteStart;

    if (siteRes && siteRes.status < 500) {
      checks.siteConnectivity = {
        ok: true,
        message: `Public site reachable at ${siteUrl}`,
        latencyMs: siteLatency,
      };
    } else {
      checks.siteConnectivity = {
        ok: false,
        message: `Could not reach public site at ${siteUrl}. Verify SITE_URL env var.`,
      };
    }
  } catch {
    checks.siteConnectivity = {
      ok: false,
      message: `Site ping timed out or failed (${siteUrl}).`,
    };
  }

  // 4. Supabase Storage Configuration
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnon) {
    checks.storage = {
      ok: true,
      message: "Supabase Storage credentials configured for media & avatar uploads.",
    };
  } else {
    checks.storage = {
      ok: false,
      message: "SUPABASE_URL or SUPABASE_ANON_KEY missing. Media uploads will fail.",
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  });
}
