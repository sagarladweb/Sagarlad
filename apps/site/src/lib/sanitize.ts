import DOMPurify from "dompurify";
import type { WindowLike } from "dompurify";

let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

function getPurify(): ReturnType<typeof DOMPurify> {
  if (purifyInstance) return purifyInstance;
  try {
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM("");
    purifyInstance = DOMPurify(window as unknown as WindowLike);
    return purifyInstance;
  } catch {
    // Fallback: strip everything dangerous with regex
    purifyInstance = {
      sanitize(html: string) {
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<\/?(?:iframe|object|embed|form|input|textarea|button|select|svg|math|meta|template|slot|style)\b[^>]*>/gi, "")
          .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
      },
    } as ReturnType<typeof DOMPurify>;
    return purifyInstance;
  }
}

// Block all event handler attributes (on*) plus dangerous attrs
const FORBID_ATTR = [
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
  return getPurify().sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      "script", "style", "iframe", "object", "embed",
      "form", "input", "textarea", "button", "select",
      "svg", "math", "meta", "template", "slot",
    ],
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
