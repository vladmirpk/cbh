const fs = require("fs");
const path = require("path");

const src = path.join(process.cwd(), "prisma", "dev.db");
const dir = path.join(process.cwd(), "backups");
fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(src)) {
  console.error("No database at prisma/dev.db");
  process.exit(1);
}
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dest = path.join(dir, `cbh-${stamp}.db`);
fs.copyFileSync(src, dest);
console.log(dest);
