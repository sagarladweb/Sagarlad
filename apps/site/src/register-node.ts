// Node.js-only: the newsletter queue drainer. On a self-hosted server (e.g.
// BigRock) with NEWSLETTER_CRON=1, drains the queue in-process so no external
// cron is needed. Disabled on Vercel serverless by default.
// Never import this from Edge-reachable code — it pulls in Prisma/Postgres.
import { processNewsletterQueue } from "@/lib/newsletter";

if (process.env.NEWSLETTER_CRON === "1") {
  const run = () => processNewsletterQueue().catch(() => {});
  run();
  setInterval(run, 15 * 60_000);
}