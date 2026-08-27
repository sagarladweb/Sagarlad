import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { prisma, dbSafe } from "@/lib/db";
import { SITE, VISIBLE_POST_WHERE, pageMetadata, formatDate, postCover } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { BlogVideoGrid } from "@/components/blog/BlogVideoGrid";

export const revalidate = 604800;

export default async function ContentCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await dbSafe(
    () =>
      prisma.category.findUnique({
        where: { slug },
        include: {
          posts: {
            where: VISIBLE_POST_WHERE,
            orderBy: { publishedAt: "desc" },
            take: 12,
          },
          videos: {
            where: { published: true, deletedAt: null },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }) as Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        posts: { id: string; title: string; slug: string; excerpt: string | null; coverImage: string | null; publishedAt: Date }[];
        videos: { id: string; title: string; slug: string | null; embedUrl: string; thumbnail: string | null }[];
      } | null>,
    null
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 text-center">
        <p className="text-5xl mb-4">📭</p>
        <h1 className="font-display text-2xl font-bold">Topic not found</h1>
        <p className="mt-3 text-muted-foreground">This topic may have been moved or is temporarily unavailable.</p>
        <Link href="/content" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
          <ArrowLeft className="w-4 h-4" /> Browse all topics
        </Link>
      </div>
    );
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Content", item: `${SITE.url}/content` },
            { "@type": "ListItem", position: 3, name: category.name, item: `${SITE.url}/content/${category.slug}` },
          ],
        }}
      />
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All topics
          </Link>
          <p className="btn-premium mt-6 inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Read
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Videos and articles on {category.name.toLowerCase()}, curated from
            Sagar&apos;s YouTube, Instagram and blog.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-16">
        {category.videos.length > 0 && (
          <section aria-label="Videos">
            <h2 className="font-display text-2xl font-bold">Videos</h2>
            <BlogVideoGrid videos={category.videos} />
          </section>
        )}

        {category.posts.length > 0 && (
          <section aria-label="Articles">
            <h2 className="font-display text-2xl font-bold">Articles</h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {category.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={postCover(post.slug)}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      {formatDate(post.publishedAt)}
                    </p>
                    <h3 className="mt-1 font-display text-sm sm:text-base font-bold leading-snug text-white line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {category.videos.length === 0 && category.posts.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">
            <p className="text-5xl mb-4">🚧</p>
            <p>This topic is being filled up. Check back soon.</p>
          </div>
        )}
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await dbSafe(
    () => prisma.category.findUnique({ where: { slug } }),
    null
  );
  if (!category) return {};
  return pageMetadata({
    title: `${category.name} — Content`,
    description: `Videos and articles on ${category.name.toLowerCase()} by Sagar Lad.`,
    path: `/content/${category.slug}`,
  });
}
