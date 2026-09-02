import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCategories, getPublishedVideos, getPostCount, getVideoCount, getPostList } from "@/lib/content";
import { SITE, VISIBLE_POST_WHERE, pageMetadata } from "@/lib/site";
import { BlogVideoGrid } from "@/components/blog/BlogVideoGrid";
import { JsonLd } from "@/components/JsonLd";
import { SubscribeModal } from "@/components/blog/SubscribeModal";
import { BlogCard } from "@/components/blog/BlogCard";

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
    getPostCount(VISIBLE_POST_WHERE),
    getVideoCount(),
  ]);
  const categorySlug = categories.some((c) => c.slug === params.category)
    ? params.category
    : undefined;

  const where: Record<string, unknown> = {
    published: true,
    deletedAt: null,
  };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (q) {
    where.AND = [
      { OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] },
      { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] },
    ];
  } else {
    where.OR = [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }];
  }

  // Only fetch the rows for the active tab. Categories and the two stats
  // counts are always needed; the list+count for the other tab are not.
  let posts: { id: string; slug: string; title: string; coverImage: string | null; publishedAt: Date; excerpt: string | null; views: number; likes: number; category: { name: string; slug: string } | null }[] = [];
  let total = 0;
  let videos: Awaited<ReturnType<typeof getPublishedVideos>> = [];

  if (tab === "posts") {
    [posts, total] = await Promise.all([
      getPostList(where, { take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
      getPostCount(where),
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
          ],
        }}
      />
      {/* Profile Header — Sagar's exact content with bottom aligned buttons */}
      <header className="pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          {/* Avatar Left */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden border-2 border-border shadow-md shrink-0 bg-muted">
            <Image
              src="/images/profile/about.webp"
              alt="Sagar Lad"
              fill
              sizes="144px"
              className="object-cover"
              priority
            />
          </div>

          {/* Right Info Section */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Sagar Lad
              </h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Author · Investor · Public Speaker
              </p>
            </div>

            {/* Stats Matrix */}
            <dl className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 text-sm">
              <div className="text-center sm:text-left">
                <dd className="font-extrabold text-foreground text-base sm:text-lg">{totalPosts}</dd>
                <dt className="text-xs text-muted-foreground font-medium">Blogs</dt>
              </div>
              <div className="text-center sm:text-left">
                <dd className="font-extrabold text-foreground text-base sm:text-lg">10K+</dd>
                <dt className="text-xs text-muted-foreground font-medium">Community</dt>
              </div>
              <div className="text-center sm:text-left">
                <dd className="font-extrabold text-foreground text-base sm:text-lg">6</dd>
                <dt className="text-xs text-muted-foreground font-medium">Books</dt>
              </div>
            </dl>

            {/* Bio Description */}
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Writing about money, career growth, and intentional living. I believe
              practical ideas — not motivational fluff — are what actually move the
              needle. Here you&apos;ll find honest articles, free eBooks, and
              frameworks I&apos;ve used to build businesses and invest wisely.
            </p>

            {/* Both Action Buttons placed AT THE BOTTOM after Bio end, perfectly aligned */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <a
                href="https://www.instagram.com/grow_with__sagar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0095F6] text-white px-5 py-2.5 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none" />
                </svg>
                Follow
              </a>
              <SubscribeModal />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav
        className="mt-10 border-t border-border flex items-stretch"
        aria-label="Blog content"
        data-animate
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
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" data-animate-group>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} showStats />
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