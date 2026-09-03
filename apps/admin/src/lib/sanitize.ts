import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type { WindowLike } from "dompurify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let purify: any = null;

function getPurify() {
  if (!purify) {
    const { window } = new JSDOM("");
    purify = DOMPurify(window as unknown as WindowLike);
  }
  return purify;
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
