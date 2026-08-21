import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { downloadToSupabase } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  // Block private/internal IPs to prevent SSRF
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host)
    ) {
      return NextResponse.json({ error: "Private/internal URLs are not allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // downloadToSupabase falls back to the *original* remote URL on failure —
  // only accept a re-hosted result so pasting never hot-links third-party CDNs.
  const imageUrl = await downloadToSupabase({ remoteUrl: url, folder: "general" });
  if (!/supabase\.co/.test(imageUrl)) {
    return NextResponse.json({ error: "Could not import that image" }, { status: 422 });
  }

  return NextResponse.json({ url: imageUrl });
}
