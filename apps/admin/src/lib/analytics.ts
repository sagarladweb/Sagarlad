import { unstable_cache } from "next/cache";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type GaDaily = {
  date: string;
  users: number;
  sessions: number;
  pageviews: number;
  avgEngagement: number;
  bounceRate: number;
};

export type GaAnalytics = {
  days: number;
  configured: boolean;
  totals: {
    users: number;
    newUsers: number;
    sessions: number;
    pageviews: number;
    events: number;
    avgEngagement: number;
    engagementRate: number;
    bounceRate: number;
  };
  daily: GaDaily[];
  topPages: { path: string; pageviews: number; users: number }[];
  topSources: { source: string; sessions: number }[];
  topDevices: { device: string; users: number }[];
  topCountries: { country: string; users: number; sessions: number }[];
  newVsReturning: { type: "new" | "returning"; users: number }[];
};

export type GaResult = { ok: true; data: GaAnalytics };

type GaConfig = {
  propertyId: string;
  credentials: { client_email: string; private_key: string };
};

export function getGaConfig(): GaConfig | null {
  const propertyId = process.env.GA_PROPERTY_ID;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !raw) return null;
  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const credentials = JSON.parse(json);
    if (!credentials.client_email || !credentials.private_key) return null;
    return { propertyId, credentials };
  } catch {
    return null;
  }
}

function num(value?: string | number | null): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toIsoDate(ymd: string): string {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

// GA4 returns bounceRate / engagementRate as proportions (0..1) — normalise to
// whole percents so callers can display them directly.
function toPercent(value?: string | number | null): number {
  return Math.round(num(value) * 100);
}

function zeroAnalytics(days: number): GaResult {
  const now = new Date();
  const daily: GaDaily[] = Array.from({ length: days }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      users: 0,
      sessions: 0,
      pageviews: 0,
      avgEngagement: 0,
      bounceRate: 0,
    };
  });
  return {
    ok: true,
    data: {
      days,
      configured: false,
      totals: {
        users: 0,
        newUsers: 0,
        sessions: 0,
        pageviews: 0,
        events: 0,
        avgEngagement: 0,
        engagementRate: 0,
        bounceRate: 0,
      },
      daily,
      topPages: [],
      topSources: [],
      topDevices: [],
      topCountries: [],
      newVsReturning: [
        { type: "new", users: 0 },
        { type: "returning", users: 0 },
      ],
    },
  };
}

async function fetchGaAnalytics(days: number): Promise<GaResult> {
  const config = getGaConfig();
  if (!config) return zeroAnalytics(days);

  const client = new BetaAnalyticsDataClient({
    credentials: config.credentials,
    projectId: config.credentials.client_email.split("@")[1] ?? undefined,
  });

  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  try {
    const [
      [overview],
      [pages],
      [sources],
      [devices],
      [countries],
      [newVsReturning],
    ] = await Promise.all([
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "events" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
          { name: "bounceRate" },
        ],
        orderBys: [{ dimension: { dimensionName: "date", orderType: "NUMERIC" }, desc: false }],
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 5,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 6,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "newVsReturningUserMetric" }],
        metrics: [{ name: "totalUsers" }],
      }),
    ]);

    const overviewRows = overview?.rows ?? [];
    const daily: GaDaily[] = overviewRows.map((row) => ({      date: toIsoDate(row.dimensionValues?.[0]?.value ?? ""),
      users: num(row.metricValues?.[0]?.value),
      sessions: num(row.metricValues?.[2]?.value),
      pageviews: num(row.metricValues?.[3]?.value),
      avgEngagement: num(row.metricValues?.[5]?.value),
      bounceRate: toPercent(row.metricValues?.[7]?.value),
    }));

    const sessions = daily.reduce((acc, d) => acc + d.sessions, 0);
    const avgEngagement = sessions
      ? daily.reduce((acc, d) => acc + d.sessions * d.avgEngagement, 0) / sessions
      : 0;

    return {
      ok: true,
      data: {
        days,
        configured: true,
        totals: {
          users: daily.reduce((acc, d) => acc + d.users, 0),
          newUsers: num(overviewRows.reduce((acc, row) => acc + num(row.metricValues?.[1]?.value), 0)),
          sessions,
          pageviews: daily.reduce((acc, d) => acc + d.pageviews, 0),
          events: num(overviewRows.reduce((acc, row) => acc + num(row.metricValues?.[4]?.value), 0)),
          avgEngagement,
          engagementRate: toPercent(
            overviewRows.reduce((acc, row) => acc + num(row.metricValues?.[6]?.value), 0) /
              Math.max(1, overviewRows.length)
          ),
          bounceRate: sessions
            ? daily.reduce((acc, d) => acc + d.sessions * d.bounceRate, 0) / sessions
            : 0,
        },
        daily,
        topPages: (pages?.rows ?? []).map((row) => ({
          path: row.dimensionValues?.[0]?.value ?? "/",
          pageviews: num(row.metricValues?.[0]?.value),
          users: num(row.metricValues?.[1]?.value),
        })),
        topSources: (sources?.rows ?? []).map((row) => ({
          source: row.dimensionValues?.[0]?.value ?? "(direct)",
          sessions: num(row.metricValues?.[0]?.value),
        })),
        topDevices: (devices?.rows ?? []).map((row) => ({
          device: row.dimensionValues?.[0]?.value ?? "(unknown)",
          users: num(row.metricValues?.[0]?.value),
        })),
        topCountries: (countries?.rows ?? []).map((row) => ({
          country: row.dimensionValues?.[0]?.value ?? "(unknown)",
          users: num(row.metricValues?.[0]?.value),
          sessions: num(row.metricValues?.[1]?.value),
        })),
        newVsReturning: (newVsReturning?.rows ?? []).map((row) => ({
          type: row.dimensionValues?.[0]?.value === "new" ? "new" : "returning",
          users: num(row.metricValues?.[0]?.value),
        })),
      },
    };
  } catch (err) {
    console.error("GA analytics fetch failed:", err);
    return zeroAnalytics(days);
  }
}

export function getGaAnalytics(days: number): Promise<GaResult> {
  return unstable_cache(() => fetchGaAnalytics(days), ["ga-analytics", String(days)], {
    revalidate: 900,
    tags: ["ga-analytics"],
  })();
}
