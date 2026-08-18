import { sanitizeHtml } from "@/lib/sanitize";

export function SanitizedContent({ html }: { html: string }) {
  const safe = sanitizeHtml(html);
  return (
    <div className="tip-content" dangerouslySetInnerHTML={{ __html: safe }} />
  );
}