// Runs once when the Next.js server starts. Compiled for BOTH the Node.js and
// Edge runtimes; `process.env.NEXT_RUNTIME` is inlined per build, so the
// require below is only ever bundled into the Node.js build. Edge builds drop
// it entirely, which keeps the Prisma/Postgres stack (pg-connection-string,
// pgpass, etc.) out of the Edge bundle where Node builtins don't exist.
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- deliberate: keeps Prisma/Postgres out of the Edge bundle
    require("./register-node");
  }
}