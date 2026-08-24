import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Renders HTML content with defense-in-depth sanitization via DOMPurify.
 * Content is sanitized at write time in the admin panel AND re-sanitized here
 * on render. If the admin session is ever compromised, XSS is still blocked.
 */
export function SanitizedContent({ html }: { html: string }) {
  return (
    <div
      className="tip-content"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
