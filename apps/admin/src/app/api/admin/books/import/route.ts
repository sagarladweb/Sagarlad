import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { downloadToSupabase } from "@/lib/storage";
export const runtime = "nodejs";

const META_VALUE =
  /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi;

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
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const link = url.searchParams.get("url");
  if (!link) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
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
      const imageUrl = await downloadToSupabase({ remoteUrl: abs, folder: "books" });
      return NextResponse.json({ title, description, imageUrl });
    }
  } catch {
    // fall through to Amazon image guess
  }

  if (remoteImage) {
    const imageUrl = await downloadToSupabase({ remoteUrl: remoteImage, folder: "books" });
    return NextResponse.json({ title, description, imageUrl });
  }

  return NextResponse.json(
    { error: "Could not read details from that link." },
    { status: 404 }
  );
}
