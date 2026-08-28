"use client";

import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { X, Play } from "lucide-react";
import { FaYoutube, FaInstagram } from "@/lib/icons";
import { youtubeId, youtubeEmbedUrl, youtubeWatchUrl, youtubeThumb } from "@/lib/youtube";
import { instagramEmbedUrl, isInstagramUrl } from "@/lib/instagram";

let dompurifyPromise: Promise<typeof import("dompurify")> | null = null;
function getDOMPurify() {
  if (!dompurifyPromise) {
    dompurifyPromise = import("dompurify");
  }
  return dompurifyPromise;
}

type Video = {
  id: string;
  title: string;
  slug?: string | null;
  embedUrl: string;
  thumbnail: string | null;
  content?: string | null;
};

// Responsive column count: 2 on mobile, 3 on lg+. Initial render is mobile
// (2 cols) to avoid a hydration mismatch; desktop reflows to 3 after mount.
function useColumnCount(): number {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setCols(mq.matches ? 3 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return cols;
}

// Rough card height (media + title block) so the greedy mason distributes
// videos into the shortest column. Only used for balancing — the browser
// still lays each card out at its real aspect ratio.
function cardHeight(v: Video, colWidth: number): number {
  const ig = isInstagramUrl(v.embedUrl);
  const ratio = ig ? 9 / 16 : 16 / 9;
  const media = ig ? Math.min(colWidth / ratio, 460) : colWidth / ratio;
  return media + 64;
}

// Greedy shortest-column masonry: each video goes into the currently shortest
// column, so rows fill left-to-right and the columns stay roughly balanced.
function useMasonryColumns<T>(items: T[], cols: number, heightOf: (item: T) => number): T[][] {
  return useMemo(() => {
    if (cols <= 1) return [items];
    const heights = new Array(cols).fill(0);
    const columns: T[][] = Array.from({ length: cols }, () => []);
    for (const item of items) {
      const target = heights.indexOf(Math.min(...heights));
      columns[target].push(item);
      heights[target] += heightOf(item);
    }
    return columns;
  }, [items, cols, heightOf]);
}

export function BlogVideoGrid({
  videos,
  masonry = false,
}: {
  videos: Video[];
  masonry?: boolean;
}) {
  const [playing, setPlaying] = useState<Video | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string | null>(null);

  const close = () => setPlaying(null);

  useEffect(() => {
    if (!playing) {
      setSanitizedContent(null);
      return;
    }
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    if (playing.content) {
      getDOMPurify().then((mod) => {
        setSanitizedContent(mod.default.sanitize(playing.content!));
      });
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playing]);

  // Pinterest-style masonry when both platforms share a page. Each card keeps
  // its native aspect ratio (9:16 reels, 16:9 widescreen); a greedy shortest-
  // column pass packs them tight in left-to-right reading order.
  const mixed = videos.some((v) => isInstagramUrl(v.embedUrl));
  const useMasonry = masonry || mixed;

  // Hooks run unconditionally (rules-of-hooks); masonry result is unused
  // when the caller requests a plain grid.
  const cols = useColumnCount();
  const colWidth = cols === 3 ? 310 : 165;
  const columns = useMasonryColumns(videos, cols, (v) => cardHeight(v, colWidth));

  if (videos.length === 0) {
    return (
      <div className="mt-10 grid min-h-[30vh] place-items-center text-center text-muted-foreground">
        <div>
          <FaYoutube className="mx-auto h-10 w-10 opacity-40" />
          <p className="mt-4">No videos available right now.</p>
        </div>
      </div>
    );
  }

  const renderCard = (v: Video) => {
    const thumb = v.thumbnail ?? youtubeThumb(v.embedUrl);
    const embedId = youtubeId(v.embedUrl);
    const ig = isInstagramUrl(v.embedUrl);

    const badge = ig ? (
      <span className="absolute top-2.5 right-2.5 grid h-7 w-8 place-items-center rounded-lg bg-[#E4405F] text-white shadow-md z-10">
        <FaInstagram className="h-3.5 w-3.5" />
      </span>
    ) : embedId ? (
      <span className="absolute top-2.5 right-2.5 grid h-7 w-9 place-items-center rounded-lg bg-[#FF0000] text-white shadow-md z-10">
        <FaYoutube className="h-3.5 w-3.5" />
      </span>
    ) : null;

    // Every card opens the overlay player — Instagram embeds and YouTube
    // both play in-page, so users never leave the site or jump to an app.
    return (
      <article
        key={v.id}
        onClick={() => setPlaying(v)}
        className="card-hover group flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:border-brand-light/70 hover:shadow-md cursor-pointer"
      >
        {/* Image Container with precise aspect ratio. Reels are capped so
            a 9:16 portrait never towers over the feed. */}
        <div
          className={`relative w-full overflow-hidden bg-black text-left ${
            ig ? "aspect-[9/16] max-h-[460px] sm:max-h-[540px]" : "aspect-[16/9]"
          }`}
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={v.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-light/40 via-brand-light/20 to-brand-light/10" />
          )}
          {/* Dark overlay & Play button */}
          <span className="absolute inset-0 grid place-items-center bg-black/25 group-hover:bg-black/40 transition-colors">
            <span className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-black/70 text-white backdrop-blur-md transition-transform group-hover:scale-110 shadow-lg border border-white/20">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </span>
          </span>
          {badge}
        </div>

        {/* Text content area — just the title */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="font-display text-xs sm:text-sm font-bold leading-snug line-clamp-2 text-foreground group-hover:text-accent-strong transition-colors">
            {v.title}
          </h3>
        </div>
      </article>
    );
  };

  // Video Modal Player — plays both Instagram and YouTube in-page.
  const modal = playing && (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={playing.title}
    >
      {/* Close button — fixed to viewport, always on top */}
      <button
        type="button"
        onClick={close}
        aria-label="Close video"
        className="btn-premium fixed top-3 right-3 sm:top-4 sm:right-4 z-[101] grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Content — my-auto centers when fits, collapses to 0 when overflows */}
      <div className="mx-auto my-auto w-full max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              {isInstagramUrl(playing.embedUrl) ? "Instagram reel" : "YouTube"}
            </p>
            <h3 className="mt-1 text-white font-display text-sm sm:text-lg font-bold leading-snug line-clamp-2">
              {playing.title}
            </h3>
          </div>
        </div>
        <div
          className={`mt-3 sm:mt-4 overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10 ${
            isInstagramUrl(playing.embedUrl)
              ? "aspect-[9/16] max-h-[65vh] mx-auto w-full max-w-[340px] sm:max-w-[400px]"
              : "aspect-video"
          }`}
        >
          <iframe
            src={
              isInstagramUrl(playing.embedUrl)
                ? instagramEmbedUrl(playing.embedUrl) ?? ""
                : `${youtubeEmbedUrl(playing.embedUrl) ?? youtubeWatchUrl(playing.embedUrl)}?autoplay=1&rel=0`
            }
            title={playing.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {playing.content && sanitizedContent && (
          <div
            className="mt-3 sm:mt-4 rounded-lg bg-white p-4 sm:p-5 text-sm text-neutral-800 leading-relaxed max-h-[35vh] sm:max-h-[40vh] overflow-y-auto prose prose-sm prose-neutral max-w-none [&_p]:my-3 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}
      </div>
    </div>
  );

  if (!useMasonry) {
    return (
      <>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {videos.map(renderCard)}
        </div>
        {modal && typeof document !== "undefined" && createPortal(modal, document.body)}
      </>
    );
  }

  return (
    <>
      <div className="mt-8 flex items-start gap-3 sm:gap-5">
        {columns.map((col, i) => (
          <div key={i} className="flex-1 min-w-0 space-y-3 sm:space-y-5">
            {col.map(renderCard)}
          </div>
        ))}
      </div>
      {modal && typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
