import Link from "next/link";
import type { Metadata } from "next";
import { prisma, dbSafe } from "@/lib/db";
import { getCategories, getPublishedVideos } from "@/lib/content";
import { pageMetadata, formatDate, postCover } from "@/lib/site";
import { BlogVideoGrid } from "@/components/blog/BlogVideoGrid";
import { SiteLogo } from "@/components/SiteLogo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Articles on money, life, career and everything in between by Sagar Lad.",
  path: "/blog",
});

export const revalidate = 604800;

const PAGE_SIZE = 9;

type Tab = "posts" | "videos";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; q?: string; tab?: string; vpage?: string }>;
}) {
  const params = await searchParams;
  const tab: Tab = params.tab === "videos" ? "videos" : "posts";
  const page = Math.max(1, Number(params.page) || 1);
  const vpage = Math.max(1, Number(params.vpage) || 1);
  const q = (params.q ?? "").trim();

  const [categories, totalPosts, totalVideos] = await Promise.all([
    getCategories(),
    dbSafe(() => prisma.post.count({ where: { published: true, deletedAt: null } }), 0),
    dbSafe(() => prisma.video.count({ where: { published: true, deletedAt: null } }), 0),
  ]);
  const categorySlug = categories.some((c) => c.slug === params.category)
    ? params.category
    : undefined;

  const where: Record<string, unknown> = { published: true, deletedAt: null };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (q) {
    where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];
  }

  // Only fetch the rows for the active tab. Categories and the two stats
  // counts are always needed; the list+count for the other tab are not.
  let posts: { id: string; slug: string; title: string; coverImage: string | null; publishedAt: Date }[] = [];
  let total = 0;
  let videos: Awaited<ReturnType<typeof getPublishedVideos>> = [];

  if (tab === "posts") {
    [posts, total] = await Promise.all([
      dbSafe(
        () =>
          prisma.post.findMany({
            where,
            select: {
              id: true,
              slug: true,
              title: true,
              coverImage: true,
              publishedAt: true,
            },
            orderBy: { publishedAt: "desc" },
            take: PAGE_SIZE,
            skip: (page - 1) * PAGE_SIZE,
          }),
        []
      ),
      dbSafe(() => prisma.post.count({ where }), 0),
    ]);
  } else {
    videos = await getPublishedVideos(PAGE_SIZE, undefined, (vpage - 1) * PAGE_SIZE);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const videoPages = Math.max(1, Math.ceil(totalVideos / PAGE_SIZE));
  const stats = [
    { label: "Blogs", value: totalPosts },
    { label: "Videos", value: totalVideos },
    { label: "Topics", value: categories.length },
  ];

  const tabLink = (t: Tab) => (t === "posts" ? "/blog" : "/blog?tab=videos");
  const tabIcon = (t: Tab) =>
    t === "posts" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 12l-5-8H6l-5 8 5 8h12l5-8zM10 9l5 3-5 3V9z" />
      </svg>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 overflow-x-clip">
      {/* Profile header */}
      <header>
        <div className="flex items-start justify-center sm:justify-start gap-5 sm:gap-8">
          <div className="shrink-0">
            <div className="grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-full border-2 border-border bg-gradient-to-br from-brand-light/20 via-background to-brand-light/10 shadow-inner overflow-hidden">
              <SiteLogo className="h-10 w-auto" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                sagarlad
              </h1>
              <a
                href="https://www.instagram.com/grow_with__sagar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0095F6] text-white px-4 py-1 text-xs sm:text-sm sm:px-5 sm:py-1.5 font-semibold hover:opacity-90 transition-opacity"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none" />
                </svg>
                Follow
              </a>
            </div>

            <dl className="mt-3 flex items-center gap-5 sm:gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-base font-bold">
                    {s.value.toLocaleString()}
                  </dd>
                  <dd className="text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 font-semibold text-[15px]">Sagar Lad</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Author · Investor · Public Speaker
            </p>
            <div className="mt-1.5 flex items-center gap-4 text-sm">
              <Link
                href="https://www.linkedin.com/in/ladsagar"
                target="_blank"
                className="inline-flex items-center gap-1 font-medium text-accent-strong underline decoration-accent-strong underline-offset-4 hover:opacity-80 transition-opacity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </Link>
              <Link
                href="https://www.youtube.com/@Sagarlad692"
                target="_blank"
                className="inline-flex items-center gap-1 font-medium text-accent-strong underline decoration-accent-strong underline-offset-4 hover:opacity-80 transition-opacity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="4" />
                  <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
                </svg>
                YouTube
              </Link>
            </div>
          </div>
        </div>

      </header>

      {/* Tabs */}
      <nav
        className="mt-10 border-t border-border flex items-stretch"
        aria-label="Blog content"
      >
        {(["posts", "videos"] as Tab[]).map((t) => (
          <Link
            key={t}
            href={tabLink(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabIcon(t)}
            {t}
          </Link>
        ))}
      </nav>

      {/* Posts tab */}
      {tab === "posts" && (
        <>
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form action="/blog" method="get" className="order-1 lg:order-2 lg:shrink-0">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search articles…"
                aria-label="Search articles"
                className="w-full lg:w-60 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </form>

            <nav
              className="no-scrollbar order-2 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:order-1 lg:mx-0 lg:flex-1 lg:px-0 lg:pb-0"
              aria-label="Blog categories"
            >
              <Link
                href="/blog"
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  !categorySlug
                    ? "bg-brand text-white border-brand"
                    : "border-border hover:bg-brand-light/10 hover:text-brand hover:border-brand-light/40"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/blog?category=${c.slug}`}
                  className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    categorySlug === c.slug
                      ? "bg-brand text-white border-brand"
                      : "border-border hover:bg-brand-light/10 hover:text-brand hover:border-brand-light/40"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>

          {posts.length === 0 ? (
            <div className="mt-16 text-center text-muted-foreground">
              <p className="text-5xl mb-4">📄</p>
              <p>No articles found. Try a different filter or search.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage || postCover(post.slug)}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-12">
                    <h2 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-[11px] text-white/60">
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-12 flex items-center justify-center gap-3"
              aria-label="Pagination"
            >
              <Link
                href={`/blog?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(q ? { q } : {}),
                  page: String(Math.max(1, page - 1)),
                })}`}
                aria-disabled={page <= 1}
                className={`rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold transition-opacity ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:opacity-90"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/blog?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(q ? { q } : {}),
                  page: String(Math.min(totalPages, page + 1)),
                })}`}
                aria-disabled={page >= totalPages}
                className={`rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold transition-opacity ${
                  page >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:opacity-90"
                }`}
              >
                Next
              </Link>
            </nav>
          )}
        </>
      )}

      {/* Videos tab */}
      {tab === "videos" && (
        <>
          <BlogVideoGrid videos={videos} masonry />
          {videoPages > 1 && (
            <nav
              className="mt-12 flex items-center justify-center gap-3"
              aria-label="Video pagination"
            >
              <Link
                href={`/blog?${new URLSearchParams({
                  tab: "videos",
                  vpage: String(Math.max(1, vpage - 1)),
                })}`}
                aria-disabled={vpage <= 1}
                className={`rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold transition-opacity ${
                  vpage <= 1 ? "pointer-events-none opacity-40" : "hover:opacity-90"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-muted-foreground">
                Page {vpage} of {videoPages}
              </span>
              <Link
                href={`/blog?${new URLSearchParams({
                  tab: "videos",
                  vpage: String(Math.min(videoPages, vpage + 1)),
                })}`}
                aria-disabled={vpage >= videoPages}
                className={`rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold transition-opacity ${
                  vpage >= videoPages
                    ? "pointer-events-none opacity-40"
                    : "hover:opacity-90"
                }`}
              >
                Next
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}