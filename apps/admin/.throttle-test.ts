import "dotenv/config";
import { prisma } from "/Users/karandhiver/Developer/Sagarlad/demo/packages/db/src/index.ts";

async function main() {
  const since = new Date(Date.now() - 30 * 60_000);
  const email = "test@example.com";
  const accountFails = await prisma.auditLogEntry.count({
    where: {
      action: { in: ["LOGIN_FAIL", "LOGIN_LOCKED", "LOGIN_THROTTLED"] },
      createdAt: { gte: since },
      meta: { path: ["email"], equals: email },
    },
  });
  const ipFails = await prisma.auditLogEntry.count({
    where: {
      action: { in: ["LOGIN_FAIL", "LOGIN_LOCKED", "LOGIN_THROTTLED"] },
      createdAt: { gte: since },
      ip: "1.2.3.4",
    },
  });
  console.log("accountFails:", accountFails, "ipFails:", ipFails, "-> JSON filter works");
  await prisma.$disconnect();
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
