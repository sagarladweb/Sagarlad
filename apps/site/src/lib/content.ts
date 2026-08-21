import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";

// Blog posts are deliberately NOT wrapped in unstable_cache here: they carry
// Date fields that unstable_cache would stringify, and the post pages already
// use ISR (`revalidate = 604800`) + `revalidatePublic()`, so the DB is only
// hit when a cached page actually revalidates. React `cache` dedupes the
// per-request double fetch (generateMetadata + render).
export const getPostBySlug = cache((slug: string) =>
  prisma.post.findUnique({
    where: { slug, deletedAt: null },
    include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { name: true } } },
  })
);

// Shared read-model helpers for stable public content (categories, videos,
// books). The results are cached for a week and re-validated instantly on
// admin writes via `revalidatePublic()` -> revalidateTag("content").
const WEEKLY = 604800;

// Supabase free-tier pauses the DB after inactivity; every content fetcher
// returns an empty fallback instead of crashing the page.

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
      return await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { posts: true, videos: true } } },
      });
    } catch (err) {
      console.warn("[content] getCategories failed:", (err as Error).message);
      return [];
    }
  },
  ["categories"],
  { revalidate: WEEKLY, tags: ["content", "categories"] }
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
  { revalidate: WEEKLY, tags: ["content", "videos"] }
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
  { revalidate: WEEKLY, tags: ["content", "videos"] }
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
  { revalidate: WEEKLY, tags: ["content", "quotes"] }
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
  { revalidate: WEEKLY, tags: ["content", "books"] }
);
