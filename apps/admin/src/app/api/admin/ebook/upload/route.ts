import { NextResponse } from "next/server";
import { uploadEbook } from "@/lib/storage";

import { requireAdmin } from "@/lib/requireAdmin";
export const runtime = "nodejs";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED = new Set([
  "application/pdf",
  "application/epub+zip",
  "application/x-mobipocket-ebook",
  "application/vnd.amazon.ebook",
]);

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF, EPUB, MOBI or AZW3." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max size is 25MB." },
      { status: 413 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = await uploadEbook({ buffer, mime: file.type, filename: file.name });
    return NextResponse.json({ path });
  } catch (err) {
    console.error("[ebook] upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
