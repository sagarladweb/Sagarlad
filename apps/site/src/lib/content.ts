import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";
import { VISIBLE_POST_WHERE } from "@/lib/site";

// Blog posts are deliberately NOT wrapped in unstable_cache here: they carry
// Date fields that unstable_cache would stringify, and the post pages already
// use ISR (`revalidate = 604800`) + `revalidatePublic()`, so the DB is only
// hit when a cached page actually revalidates. React `cache` dedupes the
// per-request double fetch (generateMetadata + render).
export const getPostBySlug = cache((slug: string) =>
  prisma.post.findFirst({
    where: { slug, ...VISIBLE_POST_WHERE },
    include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { name: true } } },
  })
);

// Shared read-model helpers for stable public content (categories, videos,
// books). The results are cached and re-validated instantly on admin writes
// via `revalidatePublic()` -> revalidateTag("content").
// In development, cache for 60 seconds so fixes apply quickly.
const CACHE_TTL = process.env.NODE_ENV === "development" ? 60 : 604800;

// Supabase free-tier pauses the DB after inactivity; every content fetcher
// returns an empty fallback instead of crashing the page.
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
  { id: "fb-bk-r1", type: "READ" as const, title: "Atomic Habits", author: "James Clear", tagline: "Tiny changes, remarkable results", description: "A practical guide to building good habits and breaking bad ones. Clear breaks down the science of habit formation into four simple laws.", learning: "Systems matter more than goals — design your environment for success", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 1, currentlyReading: false },
  { id: "fb-bk-r2", type: "READ" as const, title: "The Psychology of Money", author: "Morgan Housel", tagline: "Timeless lessons on wealth, greed, and happiness", description: "Housel explores how people think about money — the weird ways we make decisions, the role of luck, and why doing nothing is often the best financial strategy.", learning: "Wealth is what you don't see — it's the money not spent", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 2, currentlyReading: false },
  { id: "fb-bk-r3", type: "READ" as const, title: "Think and Grow Rich", author: "Napoleon Hill", tagline: "The landmark bestseller now revised and updated", description: "The 1937 classic that introduced the idea that success begins with a burning desire and a definite plan. Revised with modern commentary.", learning: "Desire backed by definite purpose is the starting point of all achievement", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 3, currentlyReading: false },
  { id: "fb-bk-r4", type: "READ" as const, title: "The Alchemist", author: "Paulo Coelho", tagline: "A fable about following your dreams", description: "A mystical story about Santiago, an Andalusian shepherd boy who travels from Spain to Egypt in search of treasure buried near the Pyramids.", learning: "When you want something, all the universe conspires to help you achieve it", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 4, currentlyReading: false },
  { id: "fb-bk-r5", type: "READ" as const, title: "Deep Work", author: "Cal Newport", tagline: "Rules for focused success in a distracted world", description: "Newport makes the case that the ability to focus without distraction is becoming increasingly rare and increasingly valuable in today's economy.", learning: "Focus is a skill that can be trained — protect your attention like your most valuable asset", note: null, imageUrl: null, buyUrl: null, free: false, featured: false, sortOrder: 5, currentlyReading: false },
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

export const getCategories = unstable_cache(
  async () => {
    try {
      const cats = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { posts: true, videos: true } } },
      });
      return cats.length > 0 ? cats : FALLBACK_CATEGORIES;
    } catch (err) {
      console.warn("[content] getCategories failed, using fallback:", (err as Error).message);
      return FALLBACK_CATEGORIES;
    }
  },
  ["categories"],
  { revalidate: CACHE_TTL, tags: ["content", "categories"] }
);

export const getPublishedVideos = unstable_cache(
  async (take?: number, platform?: "youtube" | "instagram", skip?: number) => {
    try {
      const rows = await prisma.video.findMany({
        where: { published: true, deletedAt: null },
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
      });
      return rows
        .map((v) => ({
          ...v,
          content: v.content,
        }))
        .filter((v) =>
          platform
            ? platform === "instagram"
              ? isInstagramUrl(v.embedUrl)
              : !isInstagramUrl(v.embedUrl)
            : true
        );
    } catch (err) {
      console.warn("[content] getPublishedVideos failed:", (err as Error).message);
      return FALLBACK_VIDEOS.filter((v) =>
        platform
          ? platform === "instagram"
            ? isInstagramUrl(v.embedUrl)
            : !isInstagramUrl(v.embedUrl)
          : true
      ).slice(0, take ?? undefined);
    }
  },
  ["videos"],
  { revalidate: CACHE_TTL, tags: ["content", "videos"] }
);

export const getPublishedVideoBySlug = unstable_cache(
  async (slug: string) => {
    try {
      return await prisma.video.findFirst({
        where: { slug, published: true, deletedAt: null },
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
      });
    } catch (err) {
      console.warn("[content] getPublishedVideoBySlug failed:", (err as Error).message);
      return null;
    }
  },
  ["video-by-slug"],
  { revalidate: CACHE_TTL, tags: ["content", "videos"] }
);

export const getQuotes = unstable_cache(
  async () => {
    try {
      return await prisma.quote.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, text: true, tag: true },
      });
    } catch (err) {
      console.warn("[content] getQuotes failed:", (err as Error).message);
      return FALLBACK_QUOTES;
    }
  },
  ["quotes"],
  { revalidate: CACHE_TTL, tags: ["content", "quotes"] }
);

export async function getPublishedBooks(type?: "PUBLISHED" | "READ" | "EBOOK") {
  try {
    const books = await prisma.book.findMany({
      where: { published: true, deletedAt: null, ...(type ? { type } : {}) },
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
        currentlyReading: true,
      },
    });
    console.log(`[content] getPublishedBooks(${type ?? "all"}): DB returned ${books.length} books`);
    return books;
  } catch (err) {
    console.warn("[content] getPublishedBooks FAILED:", (err as Error).message, (err as Error).stack?.split("\n")[1]);
    const fb = type ? FALLBACK_BOOKS.filter((b) => b.type === type) : FALLBACK_BOOKS;
    console.warn(`[content] returning ${fb.length} fallback books`);
    return fb;
  }
}

// ── Blog listing helpers ──────────────────────────────────────────────
// Wrapped in unstable_cache so the blog listing page doesn't hit the DB
// on every request. Revalidates weekly + instantly on admin writes via
// revalidateTag("content").

export const getPostCount = unstable_cache(
  async (where?: Record<string, unknown>) => {
    try {
      return await prisma.post.count({ where: where ?? VISIBLE_POST_WHERE });
    } catch {
      return 18;
    }
  },
  ["post-count"],
  { revalidate: CACHE_TTL, tags: ["content", "posts"] }
);

export const getVideoCount = unstable_cache(
  async () => {
    try {
      return await prisma.video.count({ where: { published: true, deletedAt: null } });
    } catch {
      return 6;
    }
  },
  ["video-count"],
  { revalidate: CACHE_TTL, tags: ["content", "videos"] }
);

export const getPostList = unstable_cache(
  async (
    where: Record<string, unknown>,
    opts: { take: number; skip: number }
  ) => {
    try {
      return await prisma.post.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          publishedAt: true,
          excerpt: true,
          views: true,
          likes: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: opts.take,
        skip: opts.skip,
      });
    } catch {
      return FALLBACK_POSTS.slice(opts.skip, opts.skip + opts.take);
    }
  },
  ["post-list"],
  { revalidate: CACHE_TTL, tags: ["content", "posts"] }
);

export const getFeaturedPosts = unstable_cache(
  async (where: Record<string, unknown>, take: number) => {
    try {
      return await prisma.post.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          publishedAt: true,
          excerpt: true,
          content: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take,
      });
    } catch (err) {
      console.warn("[content] getFeaturedPosts failed:", (err as Error).message);
      return FALLBACK_POSTS.slice(0, take).map((p) => ({
        ...p,
        content: p.excerpt,
        category: { id: "fallback-cat", name: "Life Lessons", slug: "life-lessons" },
      }));
    }
  },
  ["featured-posts"],
  { revalidate: CACHE_TTL, tags: ["content", "posts"] }
);

export const getRelatedPosts = unstable_cache(
  async (postId: string, categoryId: string | null) => {
    try {
      const where = {
        ...VISIBLE_POST_WHERE,
        NOT: { id: postId },
        ...(categoryId ? { categoryId } : { categoryId: null }),
      };
      let related = await prisma.post.findMany({
        where,
        select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      });
      if (related.length < 3) {
        related = await prisma.post.findMany({
          where: { ...VISIBLE_POST_WHERE, NOT: { id: postId } },
          select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
        });
      }
      return related.slice(0, 3);
    } catch {
      return [];
    }
  },
  ["related-posts"],
  { revalidate: CACHE_TTL, tags: ["content", "posts"] }
);

// Active announcement for the homepage banner / popup.
// NOT wrapped in unstable_cache: single-row query, always fresh.
// React `cache` deduplicates within a single request (generateMetadata + render).
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
