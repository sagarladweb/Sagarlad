import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type { WindowLike } from "dompurify";

let purify: ReturnType<typeof DOMPurify>;

function get_purify() {
  if (!purify) {
    const { window } = new JSDOM("");
    purify = DOMPurify(window as unknown as WindowLike);
  }
  return purify;
}

export function sanitizeHtml(dirty: string): string {
  return get_purify().sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "srcdoc"],
  });
}
