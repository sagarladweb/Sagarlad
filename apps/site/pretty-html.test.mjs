import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { prettyHtml, tokenize } from "./pretty-html.mjs";

const src = await readFile(process.argv[2] ?? "/tmp/dev-admin.html", "utf8");
assert.ok(src.indexOf("\n") === -1, "input expected minified (no newlines)");

const out = prettyHtml(src);

// A synthetic break is a comment whose inner data is only newlines/spaces,
// e.g. `<!--\n  -->`.
const commentData = (t) => (t.type === "comment" ? t.text.slice(4, -3) : "");
const isBreak = (t) => t.type === "comment" && /^[\n ]*$/.test(commentData(t));
const sig = (t) => (t.type === "text" ? `t:${t.text}` : `${t.type}:${t.tag || t.text}`);

// Removing the synthetic break-comments must recover the exact input token
// stream — proving only comments (never content) were added.
const inTokens = tokenize(src);
const outTokens = tokenize(out).filter((t) => !isBreak(t));
assert.strictEqual(outTokens.length, inTokens.length, "token count changed");
inTokens.forEach((t, i) => assert.strictEqual(sig(outTokens[i]), sig(t), `token #${i} altered`));

// Raw bodies (script/style/pre/textarea) are raw tokens; assert none got a
// newline injected.
tokenize(out).forEach((t) => {
  if (t.type === "raw") assert.ok(!t.text.includes("\n"), "raw body contains newline");
});

// Formatting actually happened.
const breaks = tokenize(out).filter(isBreak);
assert.ok(breaks.length > 0, "no breaks inserted");

console.log(
  `OK  ${src.length} -> ${out.length} bytes, ${breaks.length} breaks inserted`
);