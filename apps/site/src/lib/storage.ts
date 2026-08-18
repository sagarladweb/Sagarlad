import { createClient, SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "sagarlad-assets";
const EBOOK_BUCKET = "sagarlad-ebooks";

let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/**
 * Ensure the default storage bucket exists. Idempotent; safe to call on each upload.
 */
async function ensureBucket(c: SupabaseClient) {
  const { error } = await c.storage.getBucket(BUCKET);
  if (error) {
    await c.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
    });
  }
}

async function ensureEbookBucket(c: SupabaseClient) {
  const { error } = await c.storage.getBucket(EBOOK_BUCKET);
  if (error) {
    await c.storage.createBucket(EBOOK_BUCKET, {
      public: false,
      fileSizeLimit: 25 * 1024 * 1024,
    });
  }
}

/**
 * Upload an e-book file to the private `sagarlad-ebooks` bucket. The bucket is
 * NOT public and the path is never exposed to the client — the download route
 * streams it server-side via the service-role client. Returns the storage path.
 */
export async function uploadEbook(opts: {
  buffer: Buffer;
  mime?: string;
  filename?: string;
}): Promise<string> {
  const c = getClient();
  await ensureEbookBucket(c);
  const fromMime = (opts.mime ?? "").split("/").pop()?.split("+")[0];
  const fromName = opts.filename?.split(".").pop()?.toLowerCase();
  const name = `${crypto.randomUUID()}.${fromMime || fromName || "bin"}`;
  const path = `books/${name}`;

  const { error } = await c.storage.from(EBOOK_BUCKET).upload(path, opts.buffer, {
    contentType: opts.mime ?? "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`E-book upload failed: ${error.message}`);
  return path;
}

/**
 * Stream an e-book from the private bucket. Service-role client bypasses the
 * public bucket's access; works for private buckets too. Returns the blob.
 */
export async function downloadEbook(path: string): Promise<{
  data: Blob | null;
  contentType: string | null;
}> {
  const c = getClient();
  const { data, error } = await c.storage.from(EBOOK_BUCKET).download(path);
  if (error) return { data: null, contentType: null };
  return { data: data as Blob | null, contentType: (data as Blob | null)?.type ?? null };
}

/**
 * Map storage filename extension to a Content-Type so downloads can serve a
 * correct `Content-Type` header even when the blob type is empty.
 */
export const EBOOK_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  mobi: "application/x-mobipocket-ebook",
  azw3: "application/vnd.amazon.ebook",
};

/**
 * Optimize an image buffer with sharp: downscale to max 1800px, WebP quality ~82.
 * Falls back to the original buffer if sharp cannot process it (e.g. GIF).
 */
export async function optimizeImage(buffer: Buffer, mime?: string): Promise<{
  data: Buffer;
  contentType: string;
}> {
  try {
    if (mime === "image/gif") return { data: buffer, contentType: mime };
    const webp = await sharp(buffer)
      .rotate()
      .resize(1800, 1800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    return { data: webp, contentType: "image/webp" };
  } catch {
    return { data: buffer, contentType: mime ?? "application/octet-stream" };
  }
}

/**
 * Upload a file to Supabase Storage in `site-media/assets/<folder>/<name>`.
 * Images are auto-optimized to WebP (unless GIF). The stored extension always
 * matches the actual (possibly re-encoded) content type.
 * Returns the public URL for use in Next/Image and browser <img> tags.
 */
export async function uploadToSupabase(opts: {
  buffer: Buffer;
  mime?: string;
  folder?: string;
  filename?: string;
}): Promise<string> {
  const c = getClient();
  await ensureBucket(c);
  const { data, contentType } = await optimizeImage(opts.buffer, opts.mime);
  const folder = opts.folder ?? "general";
  const ext = contentType.split("/")[1]?.split("+")[0] ?? "bin";
  const name = opts.filename ?? `${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${name}`;

  const { error } = await c.storage.from(BUCKET).upload(path, data, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return publicUrl(path);
}

export function publicUrl(path: string): string {
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Download a remote image (e.g. an Amazon cover or YouTube thumbnail), optimize
 * it, and upload it to Supabase Storage so the site never hot-links third-party
 * CDNs at render time. Falls back to the original URL if the download fails.
 */
export async function downloadToSupabase(opts: {
  remoteUrl: string;
  folder: string;
}): Promise<string> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(opts.remoteUrl, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    if (blob.size > 8 * 1024 * 1024) throw new Error("Image too large");
    const buf = Buffer.from(await blob.arrayBuffer());
    return await uploadToSupabase({
      buffer: buf,
      mime: blob.type || "image/jpeg",
      folder: opts.folder,
    });
  } catch (err) {
    console.error("downloadToSupabase failed:", err);
    return opts.remoteUrl;
  }
}