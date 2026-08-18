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

  // downloadToSupabase falls back to the *original* remote URL on failure —
  // only accept a re-hosted result so pasting never hot-links third-party CDNs.
  const imageUrl = await downloadToSupabase({ remoteUrl: url, folder: "general" });
  if (!/supabase\.co/.test(imageUrl)) {
    return NextResponse.json({ error: "Could not import that image" }, { status: 422 });
  }

  return NextResponse.json({ url: imageUrl });
}
