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
  MonitorSmartphone,
  Globe2,
  RefreshCw,
  BookOpen,
  Video,
  Quote,
  MessagesSquare,
  ChevronRight,
} from "lucide-react";
import { getDashboardStats, getDashboardExtras } from "@/lib/content";
import { getGaAnalytics } from "@/lib/analytics";
import { chartGeometry, formatCompact, formatDuration } from "@/lib/charts";
import { TrafficChart } from "@/components/admin/dashboard/TrafficChart";
import { PHASE_1 } from "@/lib/phase";

export const dynamic = "force-dynamic";

// Phase 1 ships a blog-only admin, so the dashboard routes straight to Posts.
if (PHASE_1) redirect("/admin/posts");

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
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  values,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Users;
  values: number[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-accent">
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums leading-none">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      <div className="mt-auto pt-3">
        <Sparkline values={values} />
      </div>
    </div>
  );
}

function PanelCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <Icon className="w-4 h-4 text-accent" />
      </div>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const [postCount, draftCount, , recentPosts, totalViewsAgg] =
    await getDashboardStats();
  const extras = await getDashboardExtras();
  const totalViews = totalViewsAgg._sum.views ?? 0;

  const ga = await getGaAnalytics(14);
  const gaData = ga.data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const kpis = [
    {
      label: "Users",
      value: gaData.totals.users.toLocaleString(),
      sub: "unique visitors",
      icon: Users,
      values: gaData.daily.map((d) => d.users),
    },
    {
      label: "Sessions",
      value: gaData.totals.sessions.toLocaleString(),
      sub: "visits",
      icon: MousePointerClick,
      values: gaData.daily.map((d) => d.sessions),
    },
    {
      label: "Pageviews",
      value: gaData.totals.pageviews.toLocaleString(),
      sub: "last 14 days",
      icon: Eye,
      values: gaData.daily.map((d) => d.pageviews),
    },
    {
      label: "Avg. engagement",
      value: formatDuration(gaData.totals.avgEngagement),
      sub: "time per session",
      icon: Timer,
      values: gaData.daily.map((d) => d.avgEngagement),
    },
  ];

  const maxSource = Math.max(...(gaData.topSources.map((s) => s.sessions) ?? [1]));
  const maxDevice = Math.max(...(gaData.topDevices.map((d) => d.users) ?? [1]));
  const maxCountry = Math.max(...(gaData.topCountries.map((c) => c.users) ?? [1]));
  const maxNvR = Math.max(...(gaData.newVsReturning.map((n) => n.users) ?? [1]));
  const newUsers = gaData.newVsReturning.find((n) => n.type === "new")?.users ?? 0;

  const siteStats = [
    { label: "Published posts", value: postCount, href: "/admin/posts", icon: FileText },
    { label: "Drafts", value: draftCount, href: "/admin/posts", icon: FileText },
    { label: "Subscribers", value: extras.activeSubs, href: "/admin/newsletter", icon: Mail },
  ];

  const quickActions = [
    { label: "New post", href: "/admin/posts/new", icon: Plus },
    { label: "Send newsletter", href: "/admin/newsletter", icon: Mail },
    { label: "Add book", href: "/admin/books", icon: BookOpen },
    { label: "Add video", href: "/admin/videos", icon: Video },
    { label: "View site", href: "https://sagarlad.com", icon: Globe2, external: true },
  ];

  const contentStats = [
    { label: "Books", value: extras.books, href: "/admin/books", icon: BookOpen },
    { label: "Videos", value: extras.videos, href: "/admin/videos", icon: Video },
    { label: "Quotes", value: extras.quotes, href: "/admin/content", icon: Quote },
    {
      label: "Pending comments",
      value: extras.pendingComments,
      href: "/admin/moderation",
      icon: MessagesSquare,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{greeting}, Sagar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New post
        </Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {quickActions.map((a) =>
          a.external ? (
            <a
              key={a.label}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <a.icon className="w-4 h-4 text-accent" /> {a.label}
            </a>
          ) : (
            <Link
              key={a.label}
              href={a.href}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <a.icon className="w-4 h-4 text-accent" /> {a.label}
            </Link>
          )
        )}
      </div>

      {!gaData.configured && (
        <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Analytics reporting isn&apos;t connected yet — showing zeros. To light
          it up, add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GA_PROPERTY_ID</code>{" "}
          and <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GOOGLE_SERVICE_ACCOUNT_JSON</code>{" "}
          to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env</code> — see{" "}
          <span className="font-medium">CLIENT_SETUP_GUIDE.md</span>.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <TrafficChart initial={ga} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Top sources</h2>
            <Radio className="w-4 h-4 text-accent" />
          </div>
          {gaData.topSources.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No traffic yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {gaData.topSources.map((s) => (
                <li key={s.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{s.source}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {s.sessions}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${Math.max(4, (s.sessions / maxSource) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>
              Engagement{" "}
              <span className="block font-semibold text-foreground tabular-nums">
                {gaData.totals.engagementRate}%
              </span>
            </span>
            <span>
              Bounce rate{" "}
              <span className="block font-semibold text-foreground tabular-nums">
                {gaData.totals.bounceRate.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelCard title="New vs returning" icon={RefreshCw}>
          {gaData.newVsReturning.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {gaData.newVsReturning.map((n) => (
                <li key={n.type}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{n.type}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatCompact(n.users)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${Math.max(3, (n.users / maxNvR) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            {formatCompact(newUsers)} first-time visitors in the period
          </p>
        </PanelCard>

        <PanelCard title="Top devices" icon={MonitorSmartphone}>
          {gaData.topDevices.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {gaData.topDevices.map((d) => (
                <li key={d.device}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{d.device}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatCompact(d.users)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${Math.max(3, (d.users / maxDevice) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Top countries" icon={Globe2}>
          {gaData.topCountries.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {gaData.topCountries.map((c) => (
                <li key={c.country}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{c.country}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatCompact(c.users)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${Math.max(3, (c.users / maxCountry) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg font-bold">Top pages</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" /> last 14 days
          </span>
        </div>
        {gaData.topPages.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No traffic yet.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCompact(p.pageviews)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCompact(p.users)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-accent" />
        <div>
          <p className="font-display font-bold">
            {totalViews} total views
          </p>
          <p className="text-xs text-muted-foreground">
            Across all published posts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {siteStats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border bg-card p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <s.icon className="w-4 h-4 text-accent" />
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent posts</h2>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No posts yet.{" "}
            <Link href="/admin/posts/new" className="text-accent font-medium">
              Write your first one →
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPosts.map((p) => (
                  <tr key={p.slug}>
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.published
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.views}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/${encodeURIComponent(p.slug)}/edit`}
                        className="text-accent font-medium hover:underline"
                      >
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
        <PanelCard title="Newsletter" icon={Mail}>
          <div className="mt-4 space-y-3 text-sm">
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
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Last broadcast
                </p>
                <p className="mt-1 truncate font-medium">{extras.lastCampaign.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(extras.lastCampaign.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {extras.lastCampaign._count.deliveries} deliveries
                </p>
              </div>
            )}
          </div>
          <Link
            href="/admin/newsletter"
            className="mt-4 inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline"
          >
            Open newsletter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </PanelCard>

        <PanelCard title="Content" icon={FileText}>
          <ul className="mt-4 space-y-2">
            {contentStats.map((s) => (
              <li key={s.label}>
                <Link
                  href={s.href}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors"
                >
                  <span className="inline-flex items-center gap-2.5 font-medium">
                    <s.icon className="w-4 h-4 text-accent" /> {s.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Recent activity" icon={RefreshCw}>
          {extras.activity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {extras.activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{activityLabel(a.action)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {timeAgo(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
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
