import { parse } from "pg-connection-string";
import type { ConnectionOptions } from "tls";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const url = process.env.DATABASE_URL || "";
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const config = parse(url);
  const connectionString = `postgresql://${encodeURIComponent(
    config.user ?? ""
  )}:${encodeURIComponent(config.password ?? "")}@${config.host}:${config.port ?? 5432}/${
    config.database ?? ""
  }`;

  // The deployed database requires TLS but its cert isn't CA-verifiable from
  // this host. `pg-connection-string` may surface `sslmode` as `true`, a cert
  // path string, or an `SSLConfig`; collapse any of those to verified TLS,
  // otherwise connect TLS-without-verification as the working fallback.
  const ssl: boolean | ConnectionOptions = config.ssl ? true : { rejectUnauthorized: false };

  // Small pool: serverless functions each open a pool, and free-tier
  // Postgres (Supabase/Neon) caps concurrent connections. 1–5 keeps a burst
  // of lambdas from exhausting the DB. Route traffic through the provider's
  // transaction pooler in production (see CLIENT_SETUP_GUIDE.md).
  const max = Math.min(Math.max(parseInt(process.env.DATABASE_POOL_MAX ?? "5", 10) || 5, 1), 10);
  const pool = new pg.Pool({ connectionString, ssl, max });
  pool.on("error", (err) => {
    console.error("[db] idle pool error:", err.message);
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy client: created on first property access, never at import. `next build`
// evaluates route modules to collect page data, and `.env` is not uploaded to
// Vercel, so an eager module-scope throw made every admin deploy fail with
// "DATABASE_URL is not set". Queries still fail loudly if the env is genuinely
// missing, and dbSafe() turns that into a fallback instead of a crash.
function getClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;
  const client = createClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Keep the Proxy from being treated as a Promise/thenable.
    if (prop === "then") return undefined;
    const client = getClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Run a DB read with a fallback value so a paused/unreachable database (Supabase
// free tier auto-pauses) renders the page instead of crashing the request.
export async function dbSafe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (err) {
    console.warn("[db] query failed, using fallback:", (err as Error).message);
    return fallback;
  }
}

export * from "./generated/prisma/client";
