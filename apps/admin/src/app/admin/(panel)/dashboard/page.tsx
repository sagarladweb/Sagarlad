import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  MousePointerClick,
  Eye,
  Timer,
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
} from "lucide-react";
import { getDashboardStats, getDashboardExtras } from "@/lib/content";
import { getGaAnalytics } from "@/lib/analytics";
import { adminHeartbeat } from "@/lib/heartbeat";
import { chartGeometry, formatCompact, formatDuration } from "@/lib/charts";
import { TrafficChart } from "@/components/admin/dashboard/TrafficChart";
import { Card, KPICard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PublishedBadge } from "@/components/ui/Badge";
import { PHASE_1 } from "@/lib/phase";

export const dynamic = "force-dynamic";

function Sparkline({ values }: { values: number[] }) {
  const { line, area } = chartGeometry(values, 120, 36);
  if (!line) return <div className="h-9" />;
  return (
    <svg viewBox="0 0 120 36" className="w-full h-9" aria-hidden="true">
      <defs>
        <linearGradient id="kpi-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#kpi-fill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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

  try {
    adminHeartbeat(); // fire-and-forget: keep Supabase alive from admin panel
    const [published, drafts, scheduled, subs, recent, viewsAgg] = await getDashboardStats();
    recentPosts = recent;
    extras = await getDashboardExtras();
    extras.activeSubs = subs;
  } catch (e) {
    console.error("Failed to load dashboard stats:", e);
  }

  const fallbackGa = {
    ok: true as const,
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

  const ga = await getGaAnalytics(14).catch(() => fallbackGa);
  const gaData = ga.data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const kpis = [
    { label: "Users", value: gaData.totals.users.toLocaleString(), sub: "unique visitors", icon: Users, values: gaData.daily.map((d) => d.users) },
    { label: "Sessions", value: gaData.totals.sessions.toLocaleString(), sub: "visits", icon: MousePointerClick, values: gaData.daily.map((d) => d.sessions) },
    { label: "Pageviews", value: gaData.totals.pageviews.toLocaleString(), sub: "last 14 days", icon: Eye, values: gaData.daily.map((d) => d.pageviews) },
    { label: "Avg. engagement", value: formatDuration(gaData.totals.avgEngagement), sub: "time per session", icon: Timer, values: gaData.daily.map((d) => d.avgEngagement) },
  ];

  const maxSource = Math.max(...(gaData.topSources.map((s) => s.sessions) ?? [1]));
  const contentStats = [
    { label: "Books", value: extras.books, href: "/admin/books", icon: BookOpen },
    { label: "Videos", value: extras.videos, href: "/admin/videos", icon: Video },
    { label: "Quotes", value: extras.quotes, href: "/admin/content", icon: Quote },
    { label: "Pending comments", value: extras.pendingComments, href: "/admin/moderation", icon: MessagesSquare },
  ];

  const postStats = [
    { label: "Published", value: published ?? 0, icon: FileText, color: "text-green-600" },
    { label: "Drafts", value: drafts ?? 0, icon: FileText, color: "text-amber-600" },
    { label: "Scheduled", value: scheduled ?? 0, icon: Timer, color: "text-brand" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{greeting}, Sagar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <Link href="/admin/posts/new">
          <Button variant="primary">
            <Plus className="w-4 h-4" /> New post
          </Button>
        </Link>
      </header>

      {!gaData.configured && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Analytics not connected yet. Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GA_PROPERTY_ID</code> to your .env to see traffic data.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} sparkline={<Sparkline values={k.values} />} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {postStats.map((s) => (
          <Card key={s.label} title={s.label} icon={s.icon}>
            <p className="text-3xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label.toLowerCase()} posts</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <TrafficChart initial={ga} />
        </div>

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
                    <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.max(4, (s.sessions / maxSource) * 100)}%` }} />
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
      </div>

      <Card title="Top pages" icon={TrendingUp}>
        {gaData.topPages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No traffic yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Page</th>
                  <th className="px-5 py-3 text-right">Views</th>
                  <th className="px-5 py-3 text-right">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gaData.topPages.map((p) => (
                  <tr key={p.path}>
                    <td className="px-5 py-3 font-medium">{p.path}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.pageviews)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent posts</h2>
          <Link href="/admin/posts" className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No posts yet. <Link href="/admin/posts/new" className="text-accent font-medium">Write your first one →</Link>
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
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
                  <tr key={p.slug}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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

        <Card title="Content" icon={FileText}>
          <ul className="space-y-2">
            {contentStats.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors">
                  <span className="inline-flex items-center gap-2.5 font-medium">
                    <s.icon className="w-4 h-4 text-accent" /> {s.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </Link>
              </li>
            ))}
          </ul>
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
      </div>
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
