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
  id: `fallback-${c.slug}`,
  name: c.name,
  slug: c.slug,
  _count: { posts: 0, videos: 0 },
}));

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
      return [];
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
      return [];
    }
  },
  ["quotes"],
  { revalidate: CACHE_TTL, tags: ["content", "quotes"] }
);

export const getPublishedBooks = unstable_cache(
  async (type?: "PUBLISHED" | "READ" | "EBOOK") => {
    try {
      return await prisma.book.findMany({
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
        },
      });
    } catch (err) {
      console.warn("[content] getPublishedBooks failed:", (err as Error).message);
      return [];
    }
  },
  ["books"],
  { revalidate: CACHE_TTL, tags: ["content", "books"] }
);

// ── Blog listing helpers ──────────────────────────────────────────────
// Wrapped in unstable_cache so the blog listing page doesn't hit the DB
// on every request. Revalidates weekly + instantly on admin writes via
// revalidateTag("content").

export const getPostCount = unstable_cache(
  async (where?: Record<string, unknown>) => {
    try {
      return await prisma.post.count({ where: where ?? VISIBLE_POST_WHERE });
    } catch {
      return 0;
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
      return 0;
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
        },
        orderBy: { publishedAt: "desc" },
        take: opts.take,
        skip: opts.skip,
      });
    } catch {
      return [];
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
      return [];
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
