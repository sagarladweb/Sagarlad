import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";
import { isInstagramUrl } from "@/lib/instagram";

// Blog posts are deliberately NOT wrapped in unstable_cache here: they carry
// Date fields that unstable_cache would stringify, and the post pages already
// use ISR (`revalidate = 604800`) + `revalidatePublic()`, so the DB is only
// hit when a cached page actually revalidates. React `cache` dedupes the
// per-request double fetch (generateMetadata + render).
export const getPostBySlug = cache((slug: string) =>
  prisma.post.findUnique({
    where: { slug },
    include: { category: true, author: true },
  })
);

// Shared read-model helpers for stable public content (categories, videos,
// books). The results are cached for a week and re-validated instantly on
// admin writes via `revalidatePublic()` -> revalidateTag("content").
const WEEKLY = 604800;

export type VideoCard = {
  id: string;
  title: string;
  slug: string | null;
  embedUrl: string;
  thumbnail: string | null;
  content?: string | null;
  categorySlug?: string | null;
};

export const getCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true, videos: true } } },
    }),
  ["categories"],
  { revalidate: WEEKLY, tags: ["content", "categories"] }
);

export const getPublishedVideos = unstable_cache(
  async (take?: number, platform?: "youtube" | "instagram", skip?: number) =>
    prisma.video.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      ...(take ? { take } : {}),
      ...(skip ? { skip } : {}),
      select: {
        id: true,
        title: true,
        slug: true,
        embedUrl: true,
        thumbnail: true,
        content: true,
        category: { select: { slug: true } },
      },
    }).then((rows) =>
      rows.map((v) => ({
        ...v,
        content: v.content,
      })).filter((v) =>
        platform
          ? platform === "instagram" ? isInstagramUrl(v.embedUrl) : !isInstagramUrl(v.embedUrl)
          : true
      )
    ),
  ["videos"],
  { revalidate: WEEKLY, tags: ["content", "videos"] }
);

export const getPublishedVideoBySlug = unstable_cache(
  (slug: string) =>
    prisma.video.findFirst({
      where: { slug, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        embedUrl: true,
        thumbnail: true,
        content: true,
        layout: true,
        createdAt: true,
        category: { select: { slug: true, name: true } },
      },
    }),
  ["video-by-slug"],
  { revalidate: WEEKLY, tags: ["content", "videos"] }
);

export const getQuotes = unstable_cache(
  () =>
    prisma.quote.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, text: true, tag: true },
    }),
  ["quotes"],
  { revalidate: WEEKLY, tags: ["content", "quotes"] }
);

export const getPublishedBooks = unstable_cache(
  async (type?: "PUBLISHED" | "READ" | "EBOOK") =>
    prisma.book.findMany({
      where: { published: true, ...(type ? { type } : {}) },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        type: true,
        title: true,
        author: true,
        tagline: true,
        description: true,
        learning: true,
        note: true,
        imageUrl: true,
        buyUrl: true,
        free: true,
        featured: true,
        sortOrder: true,
      },
    }),
  ["books"],
  { revalidate: WEEKLY, tags: ["content", "books"] }
);

// Dashboard KPIs: always live, never cached. It's a single-admin page, so a
// cache has no traffic to amortize — and its subscriber count changes from
// PUBLIC newsletter signups, which never pass through admin write revalidation.
// A cached dashboard would show stale numbers until a TTL expired.
export function getDashboardStats() {
  return Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.post.count({ where: { scheduledAt: { not: null }, published: false } }),
    prisma.newsletterSubscriber.count(),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { title: true, slug: true, published: true, views: true },
    }),
    prisma.post.aggregate({ _sum: { views: true } }),
  ]);
}

// Extra dashboard widgets: newsletter health, content inventory and a recent
// admin-activity feed. Kept separate from getDashboardStats so the KPI page
// can stay fast — these are optional panels.
export function getDashboardExtras() {
  return Promise.all([
    prisma.newsletterSubscriber.count({ where: { unsubscribed: false } }),
    prisma.newsletterCampaign.findFirst({
      where: { draft: false },
      orderBy: { createdAt: "desc" },
      select: {
        subject: true,
        createdAt: true,
        _count: { select: { deliveries: true } },
      },
    }),
    prisma.newsletterDelivery.count({ where: { status: "QUEUED" } }),
    prisma.book.count({ where: { published: true } }),
    prisma.video.count({ where: { published: true, deletedAt: null } }),
    prisma.quote.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.auditLogEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { action: true, createdAt: true },
    }),
  ]).then(
    ([
      activeSubs,
      lastCampaign,
      queued,
      books,
      videos,
      quotes,
      pendingComments,
      activity,
    ]) => ({
      activeSubs,
      lastCampaign,
      queued,
      books,
      videos,
      quotes,
      pendingComments,
      activity,
    })
  );
}

// Fresh content to offer as one-click inserts in the newsletter composer, so a
// broadcast stays on-brand and always links current material.
export function getNewsletterInsertItems() {
  return Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, slug: true },
    }),
    prisma.video.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, slug: true },
    }),
    prisma.book.findMany({
      where: { published: true, type: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, buyUrl: true },
    }),
    prisma.book.findMany({
      where: { published: true, type: "READ" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, buyUrl: true },
    }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { text: true, tag: true },
    }),
  ]).then(([posts, videos, published, read, quotes]) => ({
    posts: posts.map((p) => ({ title: p.title, url: `${SITE.url}/blog/${p.slug}` })),
    videos: videos.map((v) => ({
      title: v.title,
      url: v.slug ? `${SITE.url}/videos/${v.slug}` : SITE.url,
    })),
    books: published.map((b) => ({ title: b.title, url: b.buyUrl || `${SITE.url}/books` })),
    read: read.map((b) => ({ title: b.title, url: b.buyUrl || `${SITE.url}/books` })),
    quotes: quotes.map((q) => ({ title: q.text, url: `${SITE.url}/quotes` })),
  }));
}
