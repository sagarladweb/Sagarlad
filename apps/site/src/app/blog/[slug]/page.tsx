import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPostBySlug } from "@/lib/content";
import { SITE, stripHtml } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PostArticle } from "@/components/blog/PostArticle";

export const revalidate = 604800;

type Props = { params: Promise<{ slug: string }> };

// Prerender every published post at build time so pages are served straight
// from the CDN cache — no DB query per visitor. New/edited posts update via
// `revalidatePublic()` on admin writes, plus the weekly ISR fallback.
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const description = post.excerpt ?? stripHtml(post.content ?? "");
  const url = `${SITE.url}/blog/${slug}`;
  const ogImage = post.coverImage ?? SITE.ogImage;
  return {
    title: `${post.title} — ${SITE.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      siteName: SITE.name,
      images: [{ url: ogImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) notFound();

  // Same-category reads first, newest published fallback when the category is
  // thin. Excludes the current post.
  const related = await prisma.post.findMany({
    where: {
      published: true,
      NOT: { id: post.id },
      ...(post.categoryId
        ? { categoryId: post.categoryId }
        : { categoryId: null }),
    },
    select: { title: true, slug: true, excerpt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const relatedPosts =
    related.length >= 3
      ? related
      : (
          await prisma.post.findMany({
            where: { published: true, NOT: { id: post.id } },
            select: { title: true, slug: true, excerpt: true, publishedAt: true },
            orderBy: { publishedAt: "desc" },
            take: 3,
          })
        ).slice(0, 3);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.coverImage ?? undefined,
          url: `${SITE.url}/blog/${post.slug}`,
          datePublished: post.publishedAt.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: {
            "@type": "Person",
            name: post.author?.name ?? SITE.name,
            url: SITE.url,
          },
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
          },
          mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
        }}
      />
      <ReadingProgress />
      <PostArticle post={post} related={relatedPosts} />
    </article>
  );
}