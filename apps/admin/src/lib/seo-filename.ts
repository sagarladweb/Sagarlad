/**
 * Generate an SEO-friendly filename from context.
 *
 * Format: `<slug>-<4char-hash>.<ext>`
 * Example: `covers/my-first-blog-post-a3f2.webp`
 *
 * The hash prevents collisions while keeping filenames human-readable
 * and keyword-rich for Google Image Search indexing.
 */

const MAX_SLUG_LEN = 60;

/** Remove non-alphanumeric chars, collapse spaces to hyphens, trim. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")               // strip accents
    .replace(/[^a-z0-9\s-]/g, "")    // drop anything not alphanumeric/space/hyphen
    .replace(/[\s_]+/g, "-")         // spaces → hyphens
    .replace(/-+/g, "-")             // collapse runs
    .replace(/^-|-$/g, "")           // trim edges
    .slice(0, MAX_SLUG_LEN);
}

/** 4-char random hex string for collision avoidance. */
function shortHash(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 4);
}

/**
 * Build an SEO-friendly filename.
 *
 * @param context  — title, slug, or descriptive text (e.g. post title, book title)
 * @param ext      — file extension WITHOUT dot (e.g. "webp", "jpg")
 * @param prefix   — optional prefix to separate variants (e.g. "inline", "cover")
 * @returns        — e.g. "my-first-blog-post-a3f2.webp" or "my-first-blog-post-cover-b7e1.webp"
 */
export function generateSeoFilename(
  context: string | undefined | null,
  ext: string,
  prefix?: string,
): string {
  const slug = slugify(context || "");
  const parts = [slug, prefix].filter(Boolean);
  const base = parts.length > 0 ? parts.join("-") : "image";
  return `${base}-${shortHash()}.${ext}`;
}
