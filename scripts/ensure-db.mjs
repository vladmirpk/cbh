import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

execSync("npx prisma db push", { stdio: "inherit" });

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
