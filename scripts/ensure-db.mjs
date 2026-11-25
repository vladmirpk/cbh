import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

/**
 * Keep the process up if push is blocked by data-loss warnings
 * (e.g. an older deploy against a newer DB). Extra columns are safe;
 * never auto-accept data loss.
 */
try {
  execSync("npx prisma db push", { stdio: "inherit" });
} catch (error) {
  console.error(
    "prisma db push did not apply. Continuing with the existing database.",
    error instanceof Error ? error.message : error,
  );
}

const prisma = new PrismaClient();
try {
  const users = await prisma.user.count();
  if (users === 0) {
    console.log("No users found — seeding demo data…");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  } else {
    console.log(`Database ready (${users} users).`);
  }
} finally {
  await prisma.$disconnect();
}
