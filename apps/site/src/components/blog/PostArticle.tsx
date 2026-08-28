import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock, Eye, Link2, Video, Image as ImageIcon } from "lucide-react";
import { SITE, formatDate, readingTime } from "@/lib/site";
import { SanitizedContent } from "@/components/SanitizedContent";
import { ShareButtons } from "@/components/blog/ShareButtons";
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
  sources?: { type: string; url: string; title: string }[] | null;
  category?: { name: string; slug?: string } | null;
  author?: { name: string | null } | null;
};

export type RelatedPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date;
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

export function PostArticle({
  post,
  related = [],
  showShare = true,
}: {
  post: PostWithRelations;
  related?: RelatedPost[];
  showShare?: boolean;
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
            <Link
              href={`/blog?category=${post.category.slug ?? ""}`}
              className="btn-premium inline-flex items-center rounded-full border border-brand-light/30 bg-brand-light/10 px-4 py-1.5 text-xs font-semibold text-brand hover:bg-brand-light/20"
            >
              {post.category.name}
            </Link>
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
            <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted">
              <Image
                src="/images/profile/about.webp"
                alt={authorName}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
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
          <div className="mb-10 overflow-hidden rounded-lg border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        <SanitizedContent html={post.content} />
      </div>

      {showShare && (
        <div className="mt-12">
          <ShareButtons title={post.title} slug={post.slug} url={`${SITE.url}/blog/${post.slug}`} />
        </div>
      )}

      {post.footerNote && (
        <div className="mt-8 rounded-lg border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          {post.footerNote}
        </div>
      )}

      {post.sources && post.sources.length > 0 && (
        <div className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Sources & References
          </h3>
          <ul className="space-y-2">
            {post.sources.map((src, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-muted-foreground">
                  {src.type === "link" && <Link2 className="w-3.5 h-3.5" />}
                  {src.type === "video" && <Video className="w-3.5 h-3.5" />}
                  {src.type === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                </span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-brand hover:underline underline-offset-2 transition-colors"
                  >
                    {src.title || src.url}
                  </a>
                ) : (
                  <span className="text-foreground">{src.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {post.showAuthorBox && (
        <div className="card-hover mt-8 flex items-center gap-5 rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
            <Image
              src="/images/profile/about.webp"
              alt={authorName}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold">{authorName}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <Link
              href="/about"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              Know Sagar better
            </Link>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Keep reading
          </h2>
          <div className="mt-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card-hover group min-w-[260px] max-w-[280px] flex-none snap-start overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-brand-light/70 hover:shadow-md sm:min-w-0 sm:max-w-none sm:flex-none"
              >
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-brand/5 font-display text-2xl font-bold text-brand/40">
                      {p.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-brand transition-colors">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                      {p.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14">
        <CommentsSection postSlug={post.slug} />
      </div>
    </article>
  );
}