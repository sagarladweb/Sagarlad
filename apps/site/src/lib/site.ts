import type { Metadata } from "next";

export const SITE = {
  name: "Sagar Lad",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://sagarlad.com").trim().replace(/\/$/, ""),
  title: "Sagar Lad Official Website",
  description:
    "Practical frameworks on money, career, life and awareness — from author, investor and public speaker Sagar Lad. Blog, books and more.",
  ogImage: "/images/heroes/hero-home.webp",
  locale: "en_IN",
} as const;

// Unified designation used across the whole site.
export const DESIGNATION = "Author · Investor · Public Speaker";

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  ogImage = SITE.ogImage,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  ogImage?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = title === SITE.name ? SITE.title : `${title} — ${SITE.name}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      type,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}


export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function readingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const BLOG_COVERS = [
  "/images/blog/blog-1.webp",
  "/images/blog/blog-2.webp",
  "/images/blog/blog-3.webp",
];

export function postCover(slug: string): string {
  let hash = 0;
  for (const ch of slug) hash = (hash << 5) - hash + ch.charCodeAt(0);
  const idx = Math.abs(hash) % BLOG_COVERS.length;
  return BLOG_COVERS[idx];
}

// Posts are visible on the public site only when published, not deleted,
// and not scheduled for a future date. Use this in every public query.
export const VISIBLE_POST_WHERE = {
  published: true,
  deletedAt: null,
  OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
};
