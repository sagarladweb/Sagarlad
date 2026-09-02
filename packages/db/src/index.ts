import { parse } from "pg-connection-string";
import type { ConnectionOptions } from "tls";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/* ── Exponential backoff cooldown ────────────────────────────────── *
 * Instead of a fixed 20 s cooldown, we double the wait each failure:
 *   1st failure → 5 s, 2nd → 10 s, 3rd → 20 s, 4th → 40 s … cap 120 s.
 * A success resets the backoff to zero.
 * ─────────────────────────────────────────────────────────────────── */
const BACKOFF_BASE_MS = 5_000;
const BACKOFF_CAP_MS = 120_000;
let dbDownUntil = 0;
let consecutiveFailures = 0;

export function isDbDown(): boolean {
  return Date.now() < dbDownUntil;
}

export function markDbDown() {
  consecutiveFailures++;
  const delay = Math.min(BACKOFF_BASE_MS * 2 ** (consecutiveFailures - 1), BACKOFF_CAP_MS);
  dbDownUntil = Date.now() + delay;
  console.warn(`[db] marked down — retry in ${Math.round(delay / 1000)}s (failure #${consecutiveFailures})`);
}

function markDbUp() {
  if (consecutiveFailures > 0) {
    console.log(`[db] connection recovered after ${consecutiveFailures} failure(s)`);
  }
  consecutiveFailures = 0;
  dbDownUntil = 0;
}

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

  const ssl: boolean | ConnectionOptions = config.ssl ? true : { rejectUnauthorized: false };

  const max = Math.min(Math.max(parseInt(process.env.DATABASE_POOL_MAX ?? "8", 10) || 8, 1), 10);
  const pool = new pg.Pool({
    connectionString,
    ssl,
    max,
    family: 4,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    query_timeout: 10000,
    statement_timeout: 10000,
  } as Record<string, unknown>);
  pool.on("error", (err) => {
    console.error("[db] idle pool error:", err.message);
  });

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
  // pg library errors
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
 * Run a DB query with retry logic and automatic cooldown.
 * Returns `fallback` if the DB is unreachable after retries.
 */
export async function dbSafe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (isDbDown()) return fallback;

  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await query();
      markDbUp();
      return result;
    } catch (err) {
      if (!isConnectionError(err)) throw err;

      if (attempt < MAX_RETRIES) {
        // Brief delay before retry (100ms first, 300ms second)
        await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
        continue;
      }

      markDbDown();
      console.warn("[db] connection error after retries, using fallback:", (err as Error).message);
      return fallback;
    }
  }

  // Unreachable, but TypeScript needs it
  return fallback;
}

export * from "./generated/prisma/client";
