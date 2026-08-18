/**
 * Video URL normalization shared by the admin panel and public surfaces.
 *
 * Accepts any human-friendly form — a watch/reel link, an embed URL, or a
 * pasted <iframe> embed snippet — and returns the canonical embed URL plus the
 * platform. Storing the canonical embed URL is what lets the public player
 * embed inline instead of linking out (Instagram's app chrome, like/follow UI,
 * is never shown).
 */
import { youtubeId, youtubeEmbedUrl } from "@/lib/youtube";
import { instagramId, instagramEmbedUrl, isInstagramUrl } from "@/lib/instagram";

export type VideoPlatform = "youtube" | "instagram";

export type NormalizedVideo = { url: string; platform: VideoPlatform };

const URL_IN_ATTR_RE = /(?:src|href|content)\s*=\s*["']([^"']+)["']/i;
const BARE_URL_RE = /\b(https?:\/\/[^\s<>"')\]},]+)/i;

function extractUrl(input: string): string {
  const attr = input.match(URL_IN_ATTR_RE);
  if (attr) return attr[1];
  const bare = input.match(BARE_URL_RE);
  return bare ? bare[1] : input.trim();
}

export function normalizeVideoUrl(input: string): NormalizedVideo | null {
  const url = extractUrl(input);
  const yt = youtubeId(url);
  if (yt) return { url: youtubeEmbedUrl(url) ?? url, platform: "youtube" };
  const ig = instagramId(url);
  if (ig) return { url: instagramEmbedUrl(url) ?? url, platform: "instagram" };
  return null;
}

export function platformFromUrl(url: string): VideoPlatform {
  return isInstagramUrl(url) ? "instagram" : "youtube";
}

/**
 * CSS aspect class for the video card/player. Instagram reels are portrait
 * (9:16); YouTube is widescreen (16:9).
 */
export function aspectClass(platform: VideoPlatform): string {
  return platform === "instagram" ? "aspect-[9/16]" : "aspect-video";
}
