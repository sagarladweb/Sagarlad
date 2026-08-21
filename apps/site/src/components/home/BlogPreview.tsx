import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post, Category } from "@sagarlad/db";
import { formatDate, readingTime, postCover } from "@/lib/site";

export function BlogPreview({
  posts,
}: {
  posts: (Post & { category: Category | null })[];
}) {
  return (
    <section className="py-20 md:py-24 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" data-animate-group>
          <div data-animate-item>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
              The blog
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
              Recent writing
            </h2>
          </div>
        </div>

        <div data-animate-group className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              data-animate-item
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage || postCover(post.slug)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                {post.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
                    {post.category.name}
                  </span>
                )}
                <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:underline underline-offset-4">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.publishedAt.toISOString()}>
                    {formatDate(post.publishedAt)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{readingTime(post.content)} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More Button redirecting to blogs page */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3.5 text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            View More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
