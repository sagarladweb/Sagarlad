import pg from "pg";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbPool: pg.Pool | undefined;
};

/* ── Recovery tracking ─────────────────────────────────────────── *
 * No cooldown short-circuit — every request always attempts the
 * query with retries. The retry delays give Supabase time to wake.
 * A success resets the failure counter.
 * ─────────────────────────────────────────────────────────────────── */
let consecutiveFailures = 0;

function markDbUp() {
  if (consecutiveFailures > 0) {
    console.log(`[db] connection recovered after ${consecutiveFailures} failure(s)`);
  }
  consecutiveFailures = 0;
}

export function markDbDown() {
  consecutiveFailures++;
  console.warn(`[db] connection failed (failure #${consecutiveFailures})`);
}

function createPool(): pg.Pool {
  const url = process.env.DATABASE_URL || "";
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const max = Math.min(Math.max(parseInt(process.env.DATABASE_POOL_MAX ?? "8", 10) || 8, 1), 10);
  const pool = new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max,
    family: 4,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    query_timeout: 15000,
    statement_timeout: 15000,
  } as Record<string, unknown>);
  pool.on("error", (err) => {
    console.error("[db] idle pool error:", err.message);
  });

  return pool;
}

function getPool(): pg.Pool {
  const existing = globalForPrisma.dbPool;
  if (existing) return existing;
  const pool = createPool();
  globalForPrisma.dbPool = pool;
  return pool;
}

function createClient() {
  const pool = getPool();
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;
  const client = createClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const client = getClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/* ── Connection-error detection ─────────────────────────────────── *
 * Only swallow connection/infrastructure errors — business logic
 * errors (constraint violations, auth failures) still propagate.
 * ─────────────────────────────────────────────────────────────────── */
const CONNECTION_ERROR_CODES = new Set([
  "P1001", "P1002", "P1003", "P1008", "P1010", "P1011", "P1012", "P1017",
  "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND",
]);

function isConnectionError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    return CONNECTION_ERROR_CODES.has((err as { code: string }).code);
  }
  const msg = (err as Error).message?.toLowerCase() ?? "";
  return (
    msg.includes("connect") ||
    msg.includes("timeout") ||
    msg.includes("econnrefused") ||
    msg.includes("econnreset") ||
    msg.includes("database is paused") ||
    msg.includes("server closed the connection unexpectedly") ||
    msg.includes("connection terminated") ||
    msg.includes("remaining connection slots are reserved")
  );
}

/**
 * Reset the pg pool — destroys all idle connections and creates fresh ones.
 * Called when the DB wakes up from a pause to clear stale connections.
 */
async function resetPool() {
  const pool = globalForPrisma.dbPool;
  if (!pool) return;
  try {
    await pool.end();
  } catch {
    // ignore
  }
  globalForPrisma.dbPool = undefined;
  globalForPrisma.prisma = undefined;
}

/**
 * Run a DB query with retry logic.
 * Retries at 2s and 5s — enough time for Supabase free-tier to wake
 * from a paused state (typically 5-15s).
 * Returns `fallback` if all retries fail.
 */
export async function dbSafe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  // Retry delays: 2s first retry, 5s second retry.
  // Supabase free-tier takes 5-15s to wake from pause.
  const RETRY_DELAYS = [2000, 5000];
  const MAX_RETRIES = RETRY_DELAYS.length;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await query();
      markDbUp();
      return result;
    } catch (err) {
      if (!isConnectionError(err)) throw err;

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        continue;
      }

      markDbDown();
      // Reset pool on failure — next request gets fresh connections
      resetPool().catch(() => {});
      console.warn("[db] connection error after retries, using fallback:", (err as Error).message);
      return fallback;
    }
  }

  return fallback;
}

export function isDbDown(): boolean {
  return consecutiveFailures > 2;
}

export * from "./generated/prisma/client";
