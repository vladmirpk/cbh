import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseJson(raw, fallback) {
  try {
    return JSON.parse(raw || "") ?? fallback;
  } catch {
    return fallback;
  }
}

const products = await prisma.product.findMany();
let n = 0;
for (const p of products) {
  const specs = parseJson(p.specs, []);
  const by = (label) =>
    specs.find((s) => (s.label || "").toLowerCase() === label)?.value || null;
  const colour = p.colour || by("colour") || by("finish");
  const sizeLabel =
    p.sizeLabel ||
    by("size") ||
    by("thickness") ||
    by("length") ||
    by("pack") ||
    by("power") ||
    by("rating") ||
    by("capacity");
  const packSize = p.packSize || by("pack");
  const existingFeatures = parseJson(p.features, []);
  const featureList = Array.isArray(existingFeatures) && existingFeatures.length
    ? existingFeatures
    : [
        colour ? `Finish / colour: ${colour}` : null,
        sizeLabel ? `Sized at ${sizeLabel}` : null,
        "Quoted with delivery from the Workington yard",
      ].filter(Boolean);
  await prisma.product.update({
    where: { id: p.id },
    data: {
      brand: p.brand || "CBH",
      modelNumber: p.modelNumber || p.sku,
      colour,
      sizeLabel,
      packSize,
      useCase: p.useCase || p.description,
      features: JSON.stringify(featureList),
      stockQty:
        p.stockQty ??
        (["coming_soon", "pre_order"].includes(p.stockStatus) ? null : 5000),
      leadTimeNote:
        p.leadTimeNote ||
        (p.stockStatus === "pre_order"
          ? "Pre-order · confirm lead time with sales"
          : p.stockStatus === "coming_soon"
            ? "Coming soon · register interest"
            : null),
      leadTimeDays:
        p.leadTimeDays ??
        (p.stockStatus === "pre_order" ? 14 : p.stockStatus === "coming_soon" ? 45 : null),
    },
  });
  n += 1;
}
console.log(`Backfilled ${n} products`);
await prisma.$disconnect();
