import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { prisma, dbSafe } from "@/lib/db";
import { pageMetadata, formatDate, postCover } from "@/lib/site";
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
            where: { published: true, deletedAt: null },
            orderBy: { publishedAt: "desc" },
            take: 12,
          },
          videos: {
            where: { published: true, deletedAt: null },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    null
  );
  if (!category) notFound();

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All topics
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            Content
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
                  className="group relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted"
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
