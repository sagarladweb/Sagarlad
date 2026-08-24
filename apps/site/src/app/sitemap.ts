import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/blog",
  "/about",
  "/books",
  "/books-read",
  "/videos",
  "/ebooks",
  "/newsletter",
  "/contact",
  "/quotes",
  "/socials",
  "/mentorship",
  "/speaking",
  "/content",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, videos] = await Promise.all([
    prisma.post.findMany({
      where: VISIBLE_POST_WHERE,
      select: { slug: true, updatedAt: true },
    }),
    prisma.video.findMany({
      where: { published: true, deletedAt: null },
      select: { slug: true, createdAt: true },
    }),
  ]);

  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${SITE.url}${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...videos
      .filter((v) => v.slug)
      .map((video) => ({
        url: `${SITE.url}/videos/${video.slug}`,
        lastModified: video.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
