import { cache } from "react";
import { prisma, dbSafe } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";
import { VISIBLE_POST_WHERE } from "@/lib/site";

// Blog posts: React `cache` dedupes per-request (generateMetadata + render).
// Page-level `revalidate = 300` handles ISR. No unstable_cache here — it
// would cache fallback data when Supabase is paused, showing stale posts
// for 5 minutes even after the DB wakes up.
export const getPostBySlug = cache((slug: string) =>
  prisma.post.findFirst({
    where: { slug, ...VISIBLE_POST_WHERE },
    include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { name: true } } },
  })
);

// ── Fallback data (used when Supabase free-tier DB is paused) ──────────
export const FALLBACK_CATEGORIES = [
  { name: "Life Lessons", slug: "life-lessons" },
  { name: "Money", slug: "money" },
  { name: "Books", slug: "books" },
  { name: "Productivity", slug: "productivity" },
  { name: "Startups", slug: "startups" },
  { name: "Anxiety", slug: "anxiety" },
  { name: "Confidence", slug: "confidence" },
  { name: "Habits", slug: "habits" },
  { name: "Happiness", slug: "happiness" },
  { name: "Health", slug: "health" },
  { name: "Relationship", slug: "relationship" },
  { name: "Motivation", slug: "motivation" },
  { name: "Technology", slug: "technology" },
  { name: "Career", slug: "career" },
  { name: "Soft Skills", slug: "soft-skills" },
  { name: "Mindset", slug: "mindset" },
  { name: "Communication", slug: "communication" },
  { name: "Emotional Intelligence", slug: "emotional-intelligence" },
].map((c) => ({
  id: `fallback-${c.slug}`, name: c.name, slug: c.slug, _count: { posts: 0, videos: 0 },
}));

const FALLBACK_VIDEOS: VideoCard[] = [];

const FALLBACK_QUOTES = [
  { id: "fb-q-1", text: "The only way to do great work is to love what you do.", tag: "motivation" },
  { id: "fb-q-2", text: "Financial freedom is available to those who learn about it and work for it.", tag: "money" },
  { id: "fb-q-3", text: "Your life does not get better by chance, it gets better by change.", tag: "life-lessons" },
  { id: "fb-q-4", text: "The best time to plant a tree was 20 years ago. The second best time is now.", tag: "money" },
  { id: "fb-q-5", text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", tag: "motivation" },
  { id: "fb-q-6", text: "Don't watch the clock; do what it does. Keep going.", tag: "productivity" },
];

const FALLBACK_BOOKS = [
  { id: "fb-bk-1", type: "PUBLISHED" as const, title: "MindUp", author: "Sagar Lad", tagline: "A practical guide to upgrading your mindset and habits", description: "MindUp distills the most powerful ideas on money, career, and personal growth into actionable steps. No fluff, no motivational clichés — just frameworks that actually work.", learning: "Practical frameworks for personal and financial growth", note: null, imageUrl: "/images/books/mindup-front.jpg", buyUrl: "https://www.amazon.in/dp/B0D86GYL5S", free: true, featured: true, sortOrder: 1, currentlyReading: false },
  { id: "fb-bk-2", type: "PUBLISHED" as const, title: "Azure", author: "Sagar Lad", tagline: "Navigate your 20s with clarity and confidence", description: "Azure is your companion for navigating the chaos of your twenties — from career decisions to relationships to building real confidence.", learning: "Navigating your 20s with intention and purpose", note: null, imageUrl: "/images/books/azure-front.webp", buyUrl: "https://www.amazon.in/dp/B0D86GYL5S", free: true, featured: true, sortOrder: 2, currentlyReading: false },
  { id: "fb-bk-r1", type: "READ" as const, title: "Atomic Habits", author: "James Clear", tagline: "Tiny changes, remarkable results", description: "A practical guide to building good habits and breaking bad ones.", learning: "Systems matter more than goals", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 1, currentlyReading: false },
  { id: "fb-bk-r2", type: "READ" as const, title: "The Psychology of Money", author: "Morgan Housel", tagline: "Timeless lessons on wealth, greed, and happiness", description: "Housel explores how people think about money.", learning: "Wealth is what you don't see", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 2, currentlyReading: false },
  { id: "fb-bk-r3", type: "READ" as const, title: "Think and Grow Rich", author: "Napoleon Hill", tagline: "The landmark bestseller", description: "The 1937 classic on success.", learning: "Desire backed by definite purpose", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 3, currentlyReading: false },
];

const FALLBACK_POSTS = [
  { id: "fb-p-1", slug: "money-mindset-shift", title: "The Money Mindset Shift That Changed Everything", coverImage: null, publishedAt: new Date("2025-01-15"), excerpt: "How a simple change in how I thought about money transformed my entire financial life.", views: 0, likes: 0, category: null },
  { id: "fb-p-2", slug: "5-books-that-changed-my-life", title: "5 Books That Changed My Life", coverImage: null, publishedAt: new Date("2025-01-08"), excerpt: "These five books shaped my thinking on money, relationships, and personal growth.", views: 0, likes: 0, category: null },
  { id: "fb-p-3", slug: "building-confidence-from-scratch", title: "Building Confidence From Scratch", coverImage: null, publishedAt: new Date("2024-12-20"), excerpt: "A practical guide to building unshakeable confidence, even if you're starting from zero.", views: 0, likes: 0, category: null },
  { id: "fb-p-4", slug: "career-advice-no-one-tells-you", title: "Career Advice No One Tells You", coverImage: null, publishedAt: new Date("2024-12-10"), excerpt: "The career advice I wish someone had given me in my early twenties.", views: 0, likes: 0, category: null },
  { id: "fb-p-5", slug: "daily-habits-for-success", title: "Daily Habits That Actually Lead to Success", coverImage: null, publishedAt: new Date("2024-11-28"), excerpt: "Stop chasing productivity hacks. These simple daily habits compound into real results.", views: 0, likes: 0, category: null },
  { id: "fb-p-6", slug: "overcoming-anxiety-guide", title: "A Practical Guide to Overcoming Anxiety", coverImage: null, publishedAt: new Date("2024-11-15"), excerpt: "Strategies that actually work for managing anxiety in daily life.", views: 0, likes: 0, category: null },
];

export type VideoCard = {
  id: string;
  title: string;
  slug: string | null;
  embedUrl: string;
  thumbnail: string | null;
  content?: string | null;
  categorySlug?: string | null;
};

// ── Content fetchers ──────────────────────────────────────────────────
// All use dbSafe for Supabase wake-up retries. No unstable_cache —
// page-level `revalidate` + React `cache()` handles deduplication.
// admin writes call `revalidateTag("content")` to bust the ISR cache.

export const getCategories = cache(async () => {
  const result = await dbSafe(
    () => prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true, videos: true } } },
    }),
    null,
  );
  if (result && result.length > 0) return result;
  console.warn("[content] getCategories: DB down, using fallback");
  return FALLBACK_CATEGORIES;
});

export const getPublishedVideos = cache(async (take?: number, platform?: "youtube" | "instagram", skip?: number) => {
  const rows = await dbSafe(
    () => prisma.video.findMany({
      where: { published: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      ...(take ? { take } : {}),
      ...(skip ? { skip } : {}),
      select: {
        id: true, title: true, slug: true, embedUrl: true,
        thumbnail: true, content: true,
        category: { select: { slug: true } },
      },
    }),
    null,
  );
  if (!rows) return FALLBACK_VIDEOS;
  return rows
    .map((v) => ({ ...v, content: v.content }))
    .filter((v) =>
      platform
        ? platform === "instagram"
          ? isInstagramUrl(v.embedUrl)
          : !isInstagramUrl(v.embedUrl)
        : true
    );
});

export const getPublishedVideoBySlug = cache(async (slug: string) => {
  return dbSafe(
    () => prisma.video.findFirst({
      where: { slug, published: true, deletedAt: null },
      select: {
        id: true, title: true, slug: true, embedUrl: true,
        thumbnail: true, content: true, layout: true, createdAt: true,
        category: { select: { slug: true, name: true } },
      },
    }),
    null,
  );
});

export const getQuotes = cache(async () => {
  const result = await dbSafe(
    () => prisma.quote.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, text: true, tag: true },
    }),
    null,
  );
  if (result && result.length > 0) return result;
  return FALLBACK_QUOTES;
});

export const getPublishedBooks = cache(async (type?: "PUBLISHED" | "READ" | "EBOOK") => {
  const books = await dbSafe(
    () => prisma.book.findMany({
      where: { published: true, deletedAt: null, ...(type ? { type } : {}) },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true, type: true, title: true, author: true, tagline: true,
        description: true, learning: true, note: true, imageUrl: true,
        buyUrl: true, free: true, featured: true, sortOrder: true,
        currentlyReading: true,
      },
    }),
    null,
  );
  if (books && books.length > 0) {
    console.log(`[content] getPublishedBooks(${type ?? "all"}): ${books.length} books from DB`);
    return books;
  }
  const fb = type ? FALLBACK_BOOKS.filter((b) => b.type === type) : FALLBACK_BOOKS;
  console.warn(`[content] getPublishedBooks: DB down, returning ${fb.length} fallback`);
  return fb;
});

// ── Blog listing helpers ──────────────────────────────────────────────

export const getPostCount = cache(async (where?: Record<string, unknown>) => {
  const count = await dbSafe(
    () => prisma.post.count({ where: where ?? VISIBLE_POST_WHERE }),
    null,
  );
  return count ?? 18;
});

export const getVideoCount = cache(async () => {
  const count = await dbSafe(
    () => prisma.video.count({ where: { published: true, deletedAt: null } }),
    null,
  );
  return count ?? 6;
});

export const getPostList = cache(async (
  where: Record<string, unknown>,
  opts: { take: number; skip: number }
) => {
  const posts = await dbSafe(
    () => prisma.post.findMany({
      where,
      select: {
        id: true, slug: true, title: true, coverImage: true,
        publishedAt: true, excerpt: true, views: true, likes: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: opts.take,
      skip: opts.skip,
    }),
    null,
  );
  if (posts && posts.length > 0) return posts;
  return FALLBACK_POSTS.slice(opts.skip, opts.skip + opts.take);
});

export const getFeaturedPosts = cache(async (where: Record<string, unknown>, take: number) => {
  const posts = await dbSafe(
    () => prisma.post.findMany({
      where,
      select: {
        id: true, slug: true, title: true, coverImage: true,
        publishedAt: true, excerpt: true, views: true, likes: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take,
    }),
    null,
  );
  if (posts && posts.length > 0) {
    console.log(`[content] getFeaturedPosts: ${posts.length} posts from DB`);
    return posts;
  }
  console.warn("[content] getFeaturedPosts: DB down, returning fallback posts");
  return FALLBACK_POSTS.slice(0, take).map((p) => ({
    ...p,
    views: 0,
    likes: 0,
    category: { id: "fallback-cat", name: "Life Lessons", slug: "life-lessons" },
  }));
});

export const getRelatedPosts = cache(async (postId: string, categoryId: string | null) => {
  const where = {
    ...VISIBLE_POST_WHERE,
    NOT: { id: postId },
    ...(categoryId ? { categoryId } : { categoryId: null }),
  };
  let related = await dbSafe(
    () => prisma.post.findMany({
      where,
      select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    null,
  );
  if (!related || related.length === 0) return [];
  if (related.length < 3) {
    related = await dbSafe(
      () => prisma.post.findMany({
        where: { ...VISIBLE_POST_WHERE, NOT: { id: postId } },
        select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      related,
    );
  }
  return (related ?? []).slice(0, 3);
});

// Active announcement — always fresh, single-row query.
export const getActiveAnnouncement = cache(async () => {
  try {
    return await prisma.announcement.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
});
