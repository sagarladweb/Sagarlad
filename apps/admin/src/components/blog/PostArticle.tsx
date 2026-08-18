import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Eye } from "lucide-react";
import { SITE, formatDate, readingTime } from "@/lib/site";
import { SanitizedContent } from "@/components/SanitizedContent";
import { CommentsSection } from "@/components/blog/CommentsSection";

type PostWithRelations = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  kicker: string | null;
  showCover: boolean;
  footerNote: string | null;
  showAuthorBox: boolean;
  publishedAt: Date;
  views?: number;
  category?: { name: string; slug?: string } | null;
  author?: { name: string | null } | null;
};

function initials(name?: string | null): string {
  if (!name) return "S";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Renders a post the same way the live site does (mirrors the site's
// PostArticle), so the /preview route is a faithful stand-in. `showComments`
// is off in the admin preview because the comments API lives on the public
// site, not here.
export function PostArticle({
  post,
  showComments = true,
}: {
  post: PostWithRelations;
  showComments?: boolean;
}) {
  const authorName = post.author?.name ?? SITE.name;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All articles
      </Link>

      <header className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          {post.category && (
            <span className="inline-flex items-center rounded-full border border-brand-light/30 bg-brand-light/10 px-3 py-1 text-xs font-semibold text-brand">
              {post.category.name}
            </span>
          )}
          {post.kicker && (
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {post.kicker}
            </p>
          )}
        </div>

        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {post.excerpt}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand font-display text-base font-bold text-white">
              {initials(authorName)}
            </span>
            <div className="text-sm leading-tight">
              <p className="font-semibold">{authorName}</p>
              <p className="text-xs text-muted-foreground">Author</p>
            </div>
          </div>
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <time
              dateTime={post.publishedAt.toISOString()}
              className="inline-flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4" /> {formatDate(post.publishedAt)}
            </time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {readingTime(post.content)} min read
            </span>
            {typeof post.views === "number" && post.views > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {post.views.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="my-10 h-px bg-border" />

      <div id="post-content">
        {post.coverImage && post.showCover && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        <SanitizedContent html={post.content} />
      </div>

      {post.footerNote && (
        <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          {post.footerNote}
        </div>
      )}

      {post.showAuthorBox && (
        <div className="mt-8 flex items-center gap-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand font-display text-xl font-bold text-white">
            {initials(authorName)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold">{authorName}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
          </div>
        </div>
      )}

      {showComments && (
        <div className="mt-14">
          <CommentsSection postSlug={post.slug} />
        </div>
      )}
    </article>
  );
}