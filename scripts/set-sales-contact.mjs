import { PrismaClient } from "@prisma/client";

const phone = "+263 78 515 3169";
const prisma = new PrismaClient();

try {
  const site = await prisma.siteSetting.update({
    where: { id: "default" },
    data: { phone, whatsapp: phone },
  });
  const sales = await prisma.user.updateMany({
    where: { email: "sales@cbh.co.zw" },
    data: { phone },
  });
  console.log(`Site phone/WhatsApp → ${site.whatsapp}; sales users updated: ${sales.count}`);
} finally {
  await prisma.$disconnect();
}
