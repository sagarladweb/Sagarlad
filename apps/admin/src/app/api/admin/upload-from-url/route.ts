import { NextResponse } from "next/server";
import dns from "node:dns";

import { requireAdmin } from "@/lib/requireAdmin";
import { downloadToSupabase } from "@/lib/storage";

export const runtime = "nodejs";

// Allowlist: only these domains can be fetched
const ALLOWED_HOSTS = new Set([
  "i.ytimg.com",
  "img.youtube.com",
  "m.media-amazon.com",
  "covers.openlibrary.org",
  "*.archive.org",
]);

function isAllowedHost(hostname: string): boolean {
  for (const allowed of ALLOWED_HOSTS) {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1); // ".archive.org"
      if (hostname.endsWith(suffix) || hostname === allowed.slice(2)) return true;
    } else if (hostname === allowed) {
      return true;
    }
  }
  return false;
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

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!/^https:\/\//i.test(url)) {
    return NextResponse.json({ error: "Only HTTPS URLs are allowed" }, { status: 400 });
  }

  // Allowlist check
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!isAllowedHost(parsed.hostname)) {
    return NextResponse.json({ error: "Domain not in allowlist" }, { status: 400 });
  }

  // DNS resolution check — block private IPs
  if (await isPrivateHost(parsed.hostname)) {
    return NextResponse.json({ error: "Private/internal URLs are not allowed" }, { status: 400 });
  }

  // downloadToSupabase falls back to the *original* remote URL on failure —
  // only accept a re-hosted result so pasting never hot-links third-party CDNs.
  const imageUrl = await downloadToSupabase({ remoteUrl: url, folder: "general" });
  if (!/supabase\.co/.test(imageUrl)) {
    return NextResponse.json({ error: "Could not import that image" }, { status: 422 });
  }

  return NextResponse.json({ url: imageUrl });
}
