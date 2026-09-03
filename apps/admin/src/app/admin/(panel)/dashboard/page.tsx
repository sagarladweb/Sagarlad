import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  FileText,
  Mail,
  TrendingUp,
  Radio,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Video,
  Quote,
  MessagesSquare,
  Globe,
  Smartphone,
  Monitor,
  Repeat,
} from "lucide-react";
import { getDashboardStats, getDashboardExtras } from "@/lib/content";
import { getGaAnalytics } from "@/lib/analytics";
import { adminHeartbeat } from "@/lib/heartbeat";
import { formatCompact } from "@/lib/charts";
import { TrafficChart } from "@/components/admin/dashboard/TrafficChart";
import { SystemHealth } from "@/components/admin/dashboard/SystemHealth";
import { WorldMap } from "@/components/admin/dashboard/WorldMap";
import { KPISection } from "@/components/admin/dashboard/KPISection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PublishedBadge } from "@/components/ui/Badge";
import { PHASE_1 } from "@/lib/phase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (PHASE_1) redirect("/admin/posts");

  let recentPosts: { title: string; slug: string; published: boolean; views: number; likes: number }[] = [];
  let published = 0;
  let drafts = 0;
  let scheduled = 0;
  let extras: {
    activeSubs: number;
    lastCampaign: { subject: string; createdAt: Date; _count: { deliveries: number } } | null;
    queued: number;
    books: number;
    videos: number;
    quotes: number;
    pendingComments: number;
    activity: { action: string; createdAt: Date }[];
  } = {
    activeSubs: 0,
    lastCampaign: null,
    queued: 0,
    books: 0,
    videos: 0,
    quotes: 0,
    pendingComments: 0,
    activity: [],
  };

  const fallbackGa: { ok: true; data: import("@/lib/analytics").GaAnalytics } = {
    ok: true,
    data: {
      days: 14,
      configured: false,
      totals: { users: 0, newUsers: 0, sessions: 0, pageviews: 0, events: 0, avgEngagement: 0, engagementRate: 0, bounceRate: 0 },
      daily: [],
      topPages: [],
      topSources: [],
      topDevices: [],
      topCountries: [],
      newVsReturning: [],
    },
  };
  let ga = fallbackGa;

  try {
    adminHeartbeat();
    const [statsResult, extrasResult, gaResult] = await Promise.all([
      getDashboardStats(),
      getDashboardExtras(),
      getGaAnalytics(14).catch(() => fallbackGa),
    ]);

    const [, , , subs, recent] = statsResult;
    recentPosts = recent;
    extras = extrasResult;
    extras.activeSubs = subs;
    ga = gaResult;
  } catch (e) {
    console.error("Failed to load dashboard stats:", e);
  }
  const gaData = ga.data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const maxSource = Math.max(...(gaData.topSources.map((s) => s.sessions) ?? [1]));
  const contentStats = [
    { label: "Books", value: extras.books, href: "/admin/books", icon: BookOpen },
    { label: "Videos", value: extras.videos, href: "/admin/videos", icon: Video },
    { label: "Quotes", value: extras.quotes, href: "/admin/content", icon: Quote },
    { label: "Comments", value: extras.pendingComments, href: "/admin/moderation", icon: MessagesSquare },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{greeting}, Sagar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <Link href="/admin/posts/new">
          <Button variant="primary">
            <Plus className="w-4 h-4" /> New post
          </Button>
        </Link>
      </header>

      {/* Analytics notice */}
      {!gaData.configured && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Analytics not connected yet. Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GA_PROPERTY_ID</code> to your .env to see traffic data.
        </div>
      )}

      {/* KPI row */}
      <KPISection totals={gaData.totals} daily={gaData.daily} />

      {/* Traffic chart — full width */}
      <section>
        <TrafficChart initial={ga} />
      </section>

      {/* Sources + Content + Newsletter side by side */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card title="Top sources" icon={Radio}>
          {gaData.topSources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No traffic yet.</p>
          ) : (
            <ul className="space-y-3">
              {gaData.topSources.map((s) => (
                <li key={s.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{s.source}</span>
                    <span className="text-muted-foreground tabular-nums">{s.sessions}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(4, (s.sessions / maxSource) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>
              Engagement{" "}
              <span className="block font-semibold text-foreground tabular-nums">{gaData.totals.engagementRate}%</span>
            </span>
            <span>
              Bounce rate{" "}
              <span className="block font-semibold text-foreground tabular-nums">{gaData.totals.bounceRate.toFixed(1)}%</span>
            </span>
          </div>
        </Card>

        <Card title="Content" icon={FileText}>
          <ul className="space-y-1">
            {contentStats.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-muted/60 transition-all duration-150">
                  <span className="inline-flex items-center gap-2.5 font-medium">
                    <s.icon className="w-4 h-4 text-accent" /> {s.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Newsletter" icon={Mail}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active subscribers</span>
              <span className="font-semibold tabular-nums">{extras.activeSubs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Queued to send</span>
              <span className="font-semibold tabular-nums">{extras.queued}</span>
            </div>
            {extras.lastCampaign && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Last broadcast</p>
                <p className="mt-1 truncate font-medium">{extras.lastCampaign.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(extras.lastCampaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {extras.lastCampaign._count.deliveries} deliveries
                </p>
              </div>
            )}
          </div>
          <Link href="/admin/newsletter" className="mt-4 inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            Open newsletter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </section>

      {/* Map + Devices + New vs Returning */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card title="Visitors by country" icon={Globe}>
            <WorldMap data={gaData.topCountries} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Devices" icon={Smartphone}>
            {gaData.topDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {gaData.topDevices.map((d) => {
                  const total = gaData.topDevices.reduce((a, x) => a + x.users, 0) || 1;
                  const pct = Math.round((d.users / total) * 100);
                  return (
                    <li key={d.device}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium">
                          {d.device === "mobile" ? (
                            <Smartphone className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-accent" />
                          )}
                          {d.device}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div className="h-1.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="New vs returning" icon={Repeat}>
            {gaData.newVsReturning.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {gaData.newVsReturning.map((n, idx) => {
                  const total = gaData.newVsReturning.reduce((a, x) => a + x.users, 0) || 1;
                  const pct = Math.round((n.users / total) * 100);
                  return (
                    <div key={`${n.type}-${idx}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{n.type}</span>
                        <span className="tabular-nums text-muted-foreground">{n.users} ({pct}%)</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${n.type === "new" ? "bg-accent" : "bg-accent/40"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* System Health + Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card title="System Health" icon={RefreshCw}>
          <SystemHealth />
        </Card>

        <Card title="Recent activity" icon={RefreshCw}>
          {extras.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {extras.activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{activityLabel(a.action)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Recent posts table */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent posts</h2>
          <Link href="/admin/posts" className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No posts yet. <Link href="/admin/posts/new" className="text-accent font-medium">Write your first one →</Link>
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPosts.map((p) => (
                  <tr key={p.slug} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3"><PublishedBadge published={p.published} /></td>
                    <td className="px-4 py-3 tabular-nums">{p.views}</td>
                    <td className="px-4 py-3 tabular-nums">{p.likes}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/posts/${encodeURIComponent(p.slug)}/edit`} className="text-accent font-medium hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top pages table */}
      {gaData.topPages.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">All pages</h2>
          <Card>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Page</th>
                    <th className="px-5 py-3 text-right">Views</th>
                    <th className="px-5 py-3 text-right">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gaData.topPages.map((p) => (
                    <tr key={p.path} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="px-5 py-3 font-medium">{p.path}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.pageviews)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.users)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

const ACTIVITY_LABELS: Record<string, string> = {
  LOGIN_OK: "Signed in",
  POST_CREATE: "Created a post",
  POST_UPDATE: "Updated a post",
  POST_DELETE: "Deleted a post",
  BOOK_CREATE: "Added a book",
  BOOK_UPDATE: "Updated a book",
  BOOK_DELETE: "Deleted a book",
  VIDEO_CREATE: "Added a video",
  VIDEO_UPDATE: "Updated a video",
  VIDEO_DELETE: "Deleted a video",
  QUOTE_CREATE: "Added a quote",
  QUOTE_UPDATE: "Updated a quote",
  QUOTE_DELETE: "Deleted a quote",
  CATEGORY_CREATE: "Added a category",
  CATEGORY_DELETE: "Deleted a category",
  COMMENT_APPROVE: "Approved a comment",
  COMMENT_DELETE: "Deleted a comment",
  SUBSCRIBER_DELETE: "Removed a subscriber",
  REQUEST_DELETE: "Deleted a request",
  NEWSLETTER: "Sent a newsletter",
  EBOOK_DOWNLOAD: "E-book download",
  UPLOAD: "Uploaded a file",
  PASSWORD_CHANGE: "Changed password",
  PROFILE_UPDATE: "Updated profile",
};

function activityLabel(action: string) {
  return ACTIVITY_LABELS[action] ?? action.toLowerCase().replace(/_/g, " ");
}

function timeAgo(date: Date) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
