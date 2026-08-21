/**
 * Renders pre-sanitized HTML. Content is sanitized at write time in the admin
 * panel; this component just passes it through to dangerouslySetInnerHTML.
 *
 * NOTE: We intentionally skip jsdom-based re-sanitization here. jsdom is a
 * heavy module that crashes Vercel serverless functions at import time when
 * loaded on-demand. Since content is sanitized on write, read-time
 * re-sanitization is redundant overhead.
 */
export function SanitizedContent({ html }: { html: string }) {
  return (
    <div className="tip-content" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
