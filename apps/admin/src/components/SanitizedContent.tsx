export function SanitizedContent({ html }: { html: string }) {
  return (
    <div className="tip-content" dangerouslySetInnerHTML={{ __html: html }} />
  );
}