// Custom server that re-indents SSR HTML before it hits the wire, so
// "View Source" shows readable markup instead of one minified line.
//
// Server must see plain (uncompressed) HTML to reformat it, so Next's
// built-in compression is disabled (next.config `compress: false`). Upgrade
// path if bandwidth ever matters: gzipSync the formatted buffer here based on
// Accept-Encoding instead.
//
// Only text/html responses are buffered (they need the full body to reformat).
// Everything else — API JSON, images, and especially streamed file downloads —
// passes straight through so headers and chunks flush to the client in real
// time. Buffering a streamed response used to make downloads hang with zero
// bytes (the body was only written at res.end).
import { createServer } from "node:http";
import next from "next";
import { prettyHtml } from "./pretty-html.mjs";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, ...(dev ? { webpack: true, turbopack: false } : {}) });
const handle = app.getRequestHandler();

function prettyResponse(req, res) {
  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  const origFlushHeaders = res.flushHeaders ? res.flushHeaders.bind(res) : () => {};

  let mode = "decide"; // decide | html | passthrough
  const setMode = (contentType) => {
    if (mode !== "decide") return;
    mode = String(contentType || "").includes("text/html") ? "html" : "passthrough";
    if (mode === "passthrough") res.flushHeaders = origFlushHeaders;
  };

  const origSetHeader = res.setHeader.bind(res);
  res.setHeader = (name, value) => {
    if (String(name).toLowerCase() === "content-type") setMode(value);
    return origSetHeader(name, value);
  };
  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = (statusCode, statusMessage, headers) => {
    if (typeof statusMessage === "object" && statusMessage) {
      setMode(statusMessage["content-type"]);
    } else if (headers) {
      setMode(headers["content-type"]);
    }
    return origWriteHead(statusCode, statusMessage, headers);
  };

  const chunks = [];
  res.flushHeaders = () => {};
  res.write = (chunk, ...args) => {
    if (mode === "decide") setMode(res.getHeader("content-type"));
    if (mode === "passthrough") return origWrite(chunk, ...args);
    chunks.push(Buffer.from(chunk));
    if (typeof args[args.length - 1] === "function") args[args.length - 1]();
    return true;
  };
  res.end = (chunk, ...args) => {
    if (chunk) {
      if (mode === "decide") setMode(res.getHeader("content-type"));
      if (mode === "passthrough") return origEnd(chunk, ...args);
      chunks.push(Buffer.from(chunk));
    }
    const cb = typeof args[args.length - 1] === "function" ? args[args.length - 1] : null;
    if (mode === "decide") mode = "html";
    if (mode === "html") {
      const body = Buffer.from(prettyHtml(Buffer.concat(chunks).toString("utf8")), "utf8");
      res.removeHeader("content-length");
      res.removeHeader("transfer-encoding");
      res.setHeader("content-length", body.length);
      if (!res.destroyed) origWrite(body);
    }
    if (!res.destroyed) origEnd();
    if (cb) cb();
  };
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    prettyResponse(req, res);
    handle(req, res);
  });
  // Forward WebSocket upgrades (HMR in dev).
  server.on("upgrade", app.getUpgradeHandler());
  server.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : "production"}`);
  });
});
