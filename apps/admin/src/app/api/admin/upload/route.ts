import { NextResponse } from "next/server";
import { uploadToSupabase } from "@/lib/storage";

import { requireAdmin } from "@/lib/requireAdmin";
export const runtime = "nodejs";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

// Storage paths are built as `<folder>/<name>`. Restrict folders to a safe
// slug so a crafted request can't escape the media bucket via `../`.
const FOLDER_RE = /^[a-z0-9][a-z0-9-_]{0,39}$/;

function upload(buffer: Buffer, mime: string, folder: string) {
  // Leave the filename extension to uploadToSupabase so it matches the actual
  // content bytes (all non-GIF images are re-encoded to WebP on the way in).
  // Avatars are downscaled hard (256px) so profile photos stay tiny.
  const maxDimension = folder === "avatars" ? 256 : 1800;
  return uploadToSupabase({
    buffer,
    mime,
    folder,
    filename: crypto.randomUUID(),
    maxDimension,
  });
}

function safeFolder(raw: FormDataEntryValue | string | null | undefined): string {
  const folder = typeof raw === "string" ? raw.trim() : "";
  return FOLDER_RE.test(folder) ? folder : "general";
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";

  // Paste-from-clipboard path: client sends a data URL (base64) as JSON.
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    const dataUrl = typeof body?.dataUrl === "string" ? body.dataUrl : "";
    const folder = safeFolder(body?.folder);
    const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif|avif));base64,([\s\S]+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Please paste a valid base64 image (copy an image, then paste it here)." },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Max size is 8MB." },
        { status: 413 }
      );
    }
    try {
      const url = await upload(buffer, match[1], folder);
      return NextResponse.json({ url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const file = form.get("file");
  const folder = safeFolder(form.get("folder"));

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, GIF or AVIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max size is 8MB." },
      { status: 413 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await upload(buffer, file.type, folder);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}