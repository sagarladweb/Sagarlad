import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type { WindowLike } from "dompurify";

const { window } = new JSDOM("");
const purify = DOMPurify(window as unknown as WindowLike);

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "srcdoc"],
  });
}
