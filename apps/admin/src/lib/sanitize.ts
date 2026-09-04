/**
 * HTML sanitizer for admin-authored content.
 *
 * Uses JSDOM + DOMPurify when available (browser-like env), falls back to
 * regex-based stripping on Vercel serverless where DOMPurify can't load.
 *
 * Strips: scripts, event handlers, dangerous tags, javascript: URIs.
 */

let purify: ((html: string) => string) | null = null;

function getSanitizer(): (html: string) => string {
  if (purify) return purify;

  try {
    // Try DOMPurify path — works when jsdom + dompurify are both loadable.
    const { JSDOM } = require("jsdom");
    const DOMPurify = require("dompurify");
    const { window } = new JSDOM("");
    const instance = DOMPurify(window);
    purify = (html: string) =>
      instance.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: [
          "script", "style", "iframe", "object", "embed",
          "form", "input", "textarea", "button", "select",
          "svg", "math", "meta", "template", "slot",
        ],
        FORBID_ATTR: FORBID_ATTR_LIST,
        ALLOW_DATA_ATTR: false,
      });
    return purify;
  } catch {
    // DOMPurify can't load (Vercel serverless) — use regex fallback.
    purify = regexSanitize;
    return purify;
  }
}

function regexSanitize(dirty: string): string {
  let clean = dirty;
  // Remove script tags and content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove remaining dangerous tags
  clean = clean.replace(/<\/?(?:iframe|object|embed|form|input|textarea|button|select|svg|math|meta|template|slot|style)\b[^>]*>/gi, "");
  // Remove on* event handlers
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Remove javascript: / vbscript: URIs in attributes
  clean = clean.replace(/((?:href|src|action)\s*=\s*(?:"[^"]*"|'[^']*'))(\s*)javascript\s*:/gi, "$1$2");
  clean = clean.replace(/((?:href|src|action)\s*=\s*(?:"[^"]*"|'[^']*'))(\s*)vbscript\s*:/gi, "$1$2");
  return clean;
}

const FORBID_ATTR_LIST = [
  "onabort", "onanimationend", "onanimationiteration", "onanimationstart",
  "onauxclick", "onbeforeinput", "onbeforetoggle", "onblur", "oncancel",
  "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose",
  "oncommand", "oncontentvisibilityautostatechange", "oncontextlost",
  "oncontextmenu", "oncontextrestored", "oncuechange", "ondblclick",
  "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover",
  "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended",
  "onerror", "onfocus", "onformdata", "ongotpointercapture", "oninput",
  "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload",
  "onloadeddata", "onloadedmetadata", "onloadstart", "onlostpointercapture",
  "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout",
  "onmouseover", "onmouseup", "onmousewheel", "onpaste", "onpause",
  "onplay", "onplaying", "onpointercancel", "onpointerdown",
  "onpointerenter", "onpointerleave", "onpointermove", "onpointerout",
  "onpointerover", "onpointerrawupdate", "onpointerup", "onprogress",
  "onratechange", "onreset", "onresize", "onscroll", "onscrollend",
  "onsecuritypolicyviolation", "onseeked", "onseeking", "onselect",
  "onselectionchange", "onselectstart", "onslotchange", "onstalled",
  "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "ontransitioncancel",
  "ontransitionend", "ontransitionrun", "ontransitionstart", "onvolumechange",
  "onwaiting", "onwebkitanimationend", "onwebkitanimationiteration",
  "onwebkitanimationstart", "onwebkittransitionend", "onwheel",
  "srcdoc", "formaction", "dynsrc", "lowsrc",
];

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  return getSanitizer()(dirty);
}
