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

  const ssl: boolean | ConnectionOptions = config.ssl ? true : { rejectUnauthorized: false };

  const max = Math.min(Math.max(parseInt(process.env.DATABASE_POOL_MAX ?? "5", 10) || 5, 1), 10);
  const pool = new pg.Pool({
    connectionString,
    ssl,
    max,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
    query_timeout: 8000,
    statement_timeout: 8000,
  });
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

// Only swallow connection/infrastructure errors — business logic errors
// (constraint violations, auth failures) still propagate.
const CONNECTION_ERROR_CODES = new Set([
  "P1001", "P1002", "P1003", "P1008", "P1010", "P1011", "P1012", "P1017",
]);

function isConnectionError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    return CONNECTION_ERROR_CODES.has((err as { code: string }).code);
  }
  const msg = (err as Error).message?.toLowerCase() ?? "";
  return msg.includes("connect") || msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("database is paused");
}

export async function dbSafe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (err) {
    if (!isConnectionError(err)) throw err;
    console.warn("[db] connection error, using fallback:", (err as Error).message);
    return fallback;
  }
}

export * from "./generated/prisma/client";
