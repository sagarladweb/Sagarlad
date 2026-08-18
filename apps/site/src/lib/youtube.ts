/**
 * YouTube URL / thumbnail helpers for the public video surfaces.
 */

const YOUTUBE_ID_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function youtubeId(url: string): string | null {
  return url.match(YOUTUBE_ID_RE)?.[1] ?? null;
}

/**
 * The most reliable "high" quality thumbnail that always exists for any public video.
 * Falls back to the standard `hqdefault`.
 */
export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function youtubeWatchUrl(url: string): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Direct YouTube CDN thumbnail (no API key, no iframe). `mqdefault` is 320x180
 * — the right size for a grid card. This is the lightweight <img> we render on
 * load; the real <iframe> only replaces it after a user click.
 */
export function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}