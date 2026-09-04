import Link from "next/link";
import { formatDate, readingTime, postCover } from "@/lib/site";
import { LikeButton } from "./LikeButton";

function dailyBonus(postId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  let h = 0x811c9dc5;
  const seed = postId + today;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h % 3;
}

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  coverImage: string | null;
  publishedAt: Date | string;
  views?: number;
  likes?: number;
  category: { name: string; slug: string } | null;
};

export function BlogCard({
  post,
  showStats = false,
}: {
  post: Post;
  showStats?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-brand-light/60 hover:text-brand hover:shadow-[0_0_0_1px_var(--brand-light)]"
      data-animate-item
      suppressHydrationWarning
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage || postCover(post.slug)}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Views badge — top right */}
        {showStats && (post.views ?? 0) > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/30 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/80">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {(post.views! + dailyBonus(post.id)).toLocaleString()}
          </div>
        )}

        {/* Category pill — top left */}
        {post.category && (
          <div className="absolute top-3 left-3 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
            {post.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h2 className="text-[15px] sm:text-base font-bold text-foreground leading-snug line-clamp-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-2 text-xs sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Meta row */}
          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden="true" className="text-border">·</span>
            <span>{readingTime(post.excerpt || post.title)}m</span>
          </div>

          {showStats && (
            <div>
              <LikeButton slug={post.slug} initialLikes={post.likes ?? 0} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
