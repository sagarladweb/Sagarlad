// Whitespace-safe HTML re-indenter for SSR output.
//
// React hydration matches the server DOM node-for-node against the client's
// tree, so a raw whitespace text node inserted between siblings the client
// didn't render is a hydration error (#418). Breaks are therefore emitted as
// comment nodes (`<!--\n  -->`): React's getNextHydratable skips plain
// comments, and a comment never renders. Everything else is emitted verbatim,
// including script/style/pre/textarea bodies and inline-flow content.

const BLOCK = new Set([
  "html", "head", "body", "div", "p", "section", "article", "header", "footer",
  "aside", "nav", "main", "figure", "figcaption", "form", "fieldset",
  "blockquote", "pre", "hr", "details", "summary", "address", "noscript",
  "template", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody",
  "tfoot", "caption", "colgroup", "tr", "th", "td", "h1", "h2", "h3", "h4",
  "h5", "h6", "script", "style",
]);

// Void elements that never produce an inline box, so a break around them
// cannot render as an inline gap.
const BLOCK_VOID = new Set(["meta", "link", "title", "base", "hr"]);

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const RAW = new Set(["script", "style", "pre", "textarea"]);

const INDENT = "  ";

function tokenize(html) {
  const tokens = [];
  let i = 0;
  const n = html.length;

  while (i < n) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      if (end === -1) { tokens.push({ type: "text", text: html.slice(i) }); break; }
      tokens.push({ type: "comment", text: html.slice(i, end + 3) });
      i = end + 3;
      continue;
    }

    if (html[i] === "<") {
      let j = i + 1;
      let quote = null;
      for (; j < n; j++) {
        const c = html[j];
        if (quote) { if (c === quote) quote = null; continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === ">") break;
        if (c === "<") break;
      }
      if (j >= n) { tokens.push({ type: "text", text: html.slice(i) }); break; }

      const tagText = html.slice(i + 1, j);
      if (/^!doctype/i.test(tagText)) {
        tokens.push({ type: "doctype", tag: html.slice(i, j + 1) });
        i = j + 1;
        continue;
      }

      const name = tagText.replace(/^\/?/, "").split(/[\s/]/)[0].toLowerCase();
      const isClose = tagText.startsWith("/");
      tokens.push({ type: isClose ? "close" : "open", name, tag: html.slice(i, j + 1), isVoid: VOID.has(name) });
      i = j + 1;

      if (!isClose && RAW.has(name)) {
        const closeTag = `</${name}`;
        const bodyEnd = html.toLowerCase().indexOf(closeTag, i);
        if (bodyEnd === -1) { tokens.push({ type: "text", text: html.slice(i) }); break; }
        if (bodyEnd > i) tokens.push({ type: "raw", text: html.slice(i, bodyEnd) });
        let k = bodyEnd + closeTag.length;
        while (k < n && html[k] !== ">") k++;
        // glue flag: close tag emitted immediately after its open/body, never
        // with a break between (whitespace inside pre/textarea is significant).
        tokens.push({ type: "close", name, tag: html.slice(bodyEnd, Math.min(k + 1, n)), glue: true });
        i = Math.min(k + 1, n);
      }
      continue;
    }

    const next = html.indexOf("<", i);
    const end = next === -1 ? n : next;
    if (end > i) tokens.push({ type: "text", text: html.slice(i, end) });
    i = end;
  }
  return tokens;
}

function isBlock(t) {
  return BLOCK.has(t.name) || BLOCK_VOID.has(t.name);
}

export function prettyHtml(html) {
  const tokens = tokenize(html);
  let out = "";
  let depth = 0;
  let lastWasTag = false;

  for (const t of tokens) {
    if (t.type === "text" || t.type === "raw") {
      out += t.text;
      lastWasTag = false;
      continue;
    }
    if (t.type === "comment") {
      out += t.text;
      lastWasTag = true; // comment produces no box; a later block tag may break
      continue;
    }

    if (t.type === "doctype") {
      // no own newline: the <html> block break (or pre-existing whitespace)
      // follows. Keeps the formatter idempotent.
      out += t.tag;
      lastWasTag = true;
      continue;
    }

    if (t.glue) {
      if (t.type === "close" && isBlock(t)) depth = Math.max(0, depth - 1);
      out += t.tag;
      lastWasTag = true;
      continue;
    }

    const block = isBlock(t);
    const close = t.type === "close";

    if (close && block) depth = Math.max(0, depth - 1); // pop before positioning
    if (block && lastWasTag) {
      // comment-wrapped break: newline+indent live inside the comment so no
      // whitespace text node reaches the DOM (hydration-safe, layout-neutral)
      out += "<!--\n" + INDENT.repeat(depth) + "-->";
    }
    if (!close && block && !t.isVoid) depth++; // push after positioning

    out += t.tag;
    lastWasTag = true;
  }
  return out;
}

export { tokenize };