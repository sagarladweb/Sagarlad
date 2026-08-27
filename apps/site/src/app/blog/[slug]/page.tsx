import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";
import { getPostBySlug, getRelatedPosts } from "@/lib/content";
import { SITE, VISIBLE_POST_WHERE, stripHtml } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PostArticle } from "@/components/blog/PostArticle";

export const revalidate = 604800;

type Props = { params: Promise<{ slug: string }> };

const getAllPostSlugs = unstable_cache(
  async () => {
    try {
      return await prisma.post.findMany({
        where: VISIBLE_POST_WHERE,
        select: { slug: true },
      });
    } catch {
      return [];
    }
  },
  ["post-slugs"],
  { revalidate: 604800, tags: ["content", "posts"] }
);

export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
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
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post || !post.published) notFound();

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId).catch(() => []);

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${post.slug}` },
          ],
        }}
      />
      <ReadingProgress />
      <PostArticle post={post} related={relatedPosts} />
    </article>
  );
}