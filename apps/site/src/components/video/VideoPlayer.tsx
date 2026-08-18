"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { aspectClass, type VideoPlatform } from "@/lib/video";
import { instagramWatchUrl } from "@/lib/instagram";

/**
 * Inline video player for the /videos/[slug] page. Shows a thumbnail with a
 * play button. YouTube clips mount the <iframe> embed only on click, so they
 * play in-page without YouTube's UI. Instagram reels can't play inline (see
 * instagramWatchUrl) so they link out to the real post — no dead embed.
 */
export function VideoPlayer({
  title,
  src,
  thumb,
  platform,
  overlay,
  pauseOnLeave = false,
}: {
  title: string;
  src: string;
  thumb: string | null;
  platform: VideoPlatform;
  overlay?: ReactNode;
  pauseOnLeave?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const square = platform === "instagram";
  const watchUrl = platform === "instagram" ? instagramWatchUrl(src) : null;
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pauseOnLeave) return;
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setPlaying(false);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pauseOnLeave]);

  return (
    <div className={square ? "mx-auto max-w-[440px]" : ""}>
      <div
        ref={boxRef}
        className={`${aspectClass(platform)} overflow-hidden rounded-3xl bg-black shadow-lg relative`}
      >
        {playing ? (
          <iframe
            src={`${src}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-light/40 to-brand-light/10" />
        )}
        {!playing &&
          (watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch on Instagram: ${title}`}
              className="absolute inset-0 grid place-items-center cursor-pointer"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform hover:scale-110">
                <ExternalLink className="w-6 h-6" />
              </span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play video: ${title}`}
              className="absolute inset-0 grid place-items-center cursor-pointer"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          ))}
        {playing && overlay && <div className="pointer-events-none absolute inset-0 z-10">{overlay}</div>}
      </div>
      {watchUrl && (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E4405F] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" /> Watch on Instagram
        </a>
      )}
    </div>
  );
}