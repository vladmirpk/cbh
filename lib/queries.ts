import { prisma } from "./prisma";

export async function getCommerce() {
  const [settings, site, vehicles, zones] = await Promise.all([
    prisma.deliverySettings.findUnique({ where: { id: "default" } }),
    prisma.siteSetting.findUnique({ where: { id: "default" } }),
    prisma.vehicle.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.zone.findMany({ where: { active: true }, orderBy: { area: "asc" } }),
  ]);
  if (!settings || !site) {
    throw new Error("CBH is not initialised yet. Run npm run db:setup.");
  }
  return { settings, site, vehicles, zones };
}

export function ratesFrom(settings: {
  baseCharge: number;
  perKm: number;
  minCharge: number;
  fuelSurchargePct: number;
  extraCharge: number;
  roadFactor: number;
}) {
  return {
    baseCharge: settings.baseCharge,
    perKm: settings.perKm,
    minCharge: settings.minCharge,
    fuelSurchargePct: settings.fuelSurchargePct,
    extraCharge: settings.extraCharge,
    roadFactor: settings.roadFactor,
  };
}

export async function activeProducts() {
  return prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}
