/**
 * Instagram post / reel URL helpers for the public video surfaces.
 */

const INSTAGRAM_ID_RE =
  /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]{6,})(?:\/|$)/;

export function instagramId(url: string): string | null {
  return url.match(INSTAGRAM_ID_RE)?.[1] ?? null;
}

export function isInstagramUrl(url: string): boolean {
  return instagramId(url) !== null;
}

export function instagramEmbedUrl(url: string): string | null {
  const id = instagramId(url);
  if (!id) return null;
  const type = url.includes("/reel/") ? "reel" : url.includes("/tv/") ? "tv" : "p";
  return `https://www.instagram.com/${type}/${id}/embed/`;
}

/**
 * The public watch URL. Instagram embeds no longer play reels with licensed
 * music inline (they show a static "Watch on Instagram" card), so cards link
 * out to the real post instead of loading a dead embed.
 */
export function instagramWatchUrl(url: string): string | null {
  const id = instagramId(url);
  if (!id) return null;
  const type = url.includes("/reel/") ? "reel" : url.includes("/tv/") ? "tv" : "p";
  return `https://www.instagram.com/${type}/${id}/`;
}
