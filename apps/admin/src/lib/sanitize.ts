/**
 * Lightweight HTML sanitizer for write-time content.
 *
 * Replaces the jsdom/DOMPurify sanitizer that crashes Vercel serverless at
 * module load. Content enters via TipTap (clean HTML), so a targeted regex
 * strip of dangerous tags/attributes is sufficient for admin-side sanitization.
 */

const STRIP_TAGS_RE = /<\s*(script|style|iframe|object|embed|form|input|textarea|button|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const SELF_CLOSING_RE = /<\s*(script|style|iframe|object|embed|form|input|textarea|button|select)[^>]*\/?>/gi;
const EVENT_ATTR_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_HREF_RE = /(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;
const SRCDOC_RE = /\ssrcdoc\s*=\s*(?:"[^"]*"|'[^']*')/gi;

export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(STRIP_TAGS_RE, "")
    .replace(SELF_CLOSING_RE, "")
    .replace(EVENT_ATTR_RE, "")
    .replace(JS_HREF_RE, "")
    .replace(SRCDOC_RE, "");
}
