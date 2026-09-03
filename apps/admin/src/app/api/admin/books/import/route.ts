import { NextResponse } from "next/server";
import dns from "node:dns";

import { requireAdmin } from "@/lib/requireAdmin";
import { downloadToSupabase } from "@/lib/storage";
export const runtime = "nodejs";

const META_VALUE =
  /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi;

// Allowlist: only these domains can be fetched via SSRF
const ALLOWED_HOSTS = new Set([
  "amazon.com",
  "www.amazon.com",
  "m.media-amazon.com",
  "goodreads.com",
  "www.goodreads.com",
  "openlibrary.org",
  "covers.openlibrary.org",
  "archive.org",
  "www.archive.org",
]);

function isAllowedUrl(raw: string): { ok: boolean; error?: string } {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return { ok: false, error: "Only HTTPS URLs are allowed" };
    if (!ALLOWED_HOSTS.has(u.hostname)) {
      return { ok: false, error: "Domain not in allowlist" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid URL" };
  }
}

async function isPrivateHost(hostname: string): Promise<boolean> {
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    return addresses.some((a) => {
      const ip = a.address;
      return (
        ip === "127.0.0.1" ||
        ip === "::1" ||
        ip === "0.0.0.0" ||
        /^10\./.test(ip) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
        /^192\.168\./.test(ip) ||
        /^169\.254\./.test(ip) ||
        /^fc00:/i.test(ip) ||
        /^fe80:/i.test(ip)
      );
    });
  } catch {
    return true; // fail closed
  }
}

function meta(html: string, keys: string[]): string | null {
  let m: RegExpExecArray | null;
  META_VALUE.lastIndex = 0;
  while ((m = META_VALUE.exec(html))) {
    if (keys.includes(m[1].toLowerCase())) {
      return m[2]
        .replace(/&amp;/g, "&")
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();
    }
  }
  return null;
}

function amazonAsin(url: string): string | null {
  const m = url.match(/(?:dp|gp\/product|asin)\/([A-Z0-9]{10})/i);
  if (m) return m[1];
  const q = url.match(/[?&]asin=([A-Z0-9]{10})/i);
  return q ? q[1] : null;
}

export async function GET(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const link = url.searchParams.get("url");
  if (!link) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Allowlist check — only known domains
  const check = isAllowedUrl(link);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  // DNS resolution check — block private IPs even if domain resolves to them
  const u = new URL(link);
  if (await isPrivateHost(u.hostname)) {
    return NextResponse.json({ error: "Private/internal URLs are not allowed" }, { status: 400 });
  }

  const asin = amazonAsin(link);
  const remoteImage = asin
    ? `https://m.media-amazon.com/images/P/${asin}.jpg`
    : null;

  let title: string | null = null;
  let description: string | null = null;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(link, { signal: controller.signal, redirect: "follow" });
    const html = await res.text();
    clearTimeout(t);
    title =
      meta(html, ["og:title", "twitter:title"]) ??
      meta(html, ["title"]) ??
      html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ??
      null;
    description =
      meta(html, ["og:description", "twitter:description"]) ??
      meta(html, ["description"]) ??
      null;
    const ogImage = meta(html, ["og:image", "twitter:image"]);
    if (ogImage) {
      const abs = /^https?:\/\//.test(ogImage) ? ogImage : new URL(ogImage, link).href;
      const imageUrl = await downloadToSupabase({ remoteUrl: abs, folder: "books", name: title || undefined });
      return NextResponse.json({ title, description, imageUrl });
    }
  } catch {
    // fall through to Amazon image guess
  }

  if (remoteImage) {
    const imageUrl = await downloadToSupabase({ remoteUrl: remoteImage, folder: "books", name: title || undefined });
    return NextResponse.json({ title, description, imageUrl });
  }

  return NextResponse.json(
    { error: "Could not read details from that link." },
    { status: 404 }
  );
}
