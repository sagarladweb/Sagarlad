import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublishedVideoBySlug } from "@/lib/content";
import { pageMetadata, formatDate } from "@/lib/site";
import { youtubeThumb } from "@/lib/youtube";
import { normalizeVideoUrl, platformFromUrl, type VideoPlatform } from "@/lib/video";
import { sanitizeHtml } from "@/lib/sanitize";
import { VideoPlayer } from "@/components/video/VideoPlayer";

export const revalidate = 604800;

export const dynamicParams = true;

export default async function VideoArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getPublishedVideoBySlug(slug);
  if (!video) notFound();

  const embedId = video.embedUrl;
  const norm = normalizeVideoUrl(embedId);
  const embedSrc = norm?.url ?? embedId;
  const platform: VideoPlatform = norm?.platform ?? platformFromUrl(embedId);
  const thumb = video.thumbnail ?? youtubeThumb(embedId);
  const hasText = (video.content ?? "").trim().length > 0;
  const content = video.content ? sanitizeHtml(video.content) : "";
  const layout = (video.layout as "video-first" | "text-first" | "split") ?? "video-first";

  const videoPlayer = (
    <VideoPlayer title={video.title} src={embedSrc} thumb={thumb} platform={platform} />
  );

  const body = hasText ? (
    <div
      className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed [&_p]:my-4 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent-strong [&_a]:underline [&_strong]:text-foreground"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : null;

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All videos
          </Link>
          {video.category && (
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
              {video.category.name}
            </p>
          )}
          <h1 className="mt-3 max-w-3xl font-display text-3xl md:text-4xl font-bold tracking-tight">
            {video.title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatDate(video.createdAt)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
        <div
          className={
            layout === "split"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
              : "mx-auto max-w-3xl space-y-10"
          }
        >
          {layout === "text-first" ? (
            <>
              {body}
              {videoPlayer}
            </>
          ) : (
            <>
              {videoPlayer}
              {body}
            </>
          )}
        </div>
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
  const video = await getPublishedVideoBySlug(slug);
  if (!video) return {};
  return pageMetadata({
    title: video.title,
    description: video.content
      ? video.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
      : `Watch ${video.title} by Sagar Lad.`,
    path: `/videos/${video.slug}`,
  });
}