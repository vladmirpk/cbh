/**
 * Point live catalogue / category / promotion images at /cbh_images/* without a full reseed.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const asset = (file) => `/cbh_images/${file}`;

const products = {
  "cbh-common-brick": [asset("common_brick.jpg")],
  "cbh-face-brick": [asset("face_brick.jpg")],
  "cbh-engineering-brick": [asset("engineering_brick.jpg")],
  "cbh-maxi-brick": [asset("maxi_brick.jpg")],
  "paver-60-grey": [asset("interlocking_pavers.jpg"), asset("pavers.jpg")],
  "paver-60-charcoal": [asset("charcoal_pavers_interlocking.jpg")],
  "paver-80-heavy": [asset("inter_locking_heavy_duty.jpg")],
  "paver-slab-400": [asset("paver_slabs.jpg")],
  "kerbstone-1000": [asset("kerbstone.jpg"), asset("kerbstone_2.webp")],
  "mountable-kerb": [asset("mountable_kerbstone.jpg")],
  "pool-coping-bullnose": [asset("pool_coping.jpg")],
  "portland-cement-50kg": [asset("portland_cement.jpg")],
  "river-sand": [asset("river_sand.jpg")],
  "pit-sand": [asset("pit_sand.jpg")],
  "cbh-solar-home": [asset("home_solar_system.jpg"), asset("home-solar-power-system.png"), asset("home_solar_systems.jpg")],
  "panel-550w": [asset("home_solar_systems.jpg"), asset("home-solar-power-system.png")],
  "inverter-5kva": [asset("inverter.png")],
  "battery-5kwh": [asset("5kwh_lithium_battery.jpg")],
  "solar-pump-kit": [asset("solar_water_pump_kit.jpg")],
  "led-floodlight-100w": [asset("floodlights.jpg")],
  "garden-edging": [asset("pavers.jpg")],
  "decorative-cobble": [asset("paver_slabs.jpg")],
};

const categories = {
  bricks: asset("common_brick.jpg"),
  pavers: asset("interlocking_pavers.jpg"),
  kerbstones: asset("kerbstone.jpg"),
  "paver-slabs": asset("paver_slabs.jpg"),
  "pool-copings": asset("pool_coping.jpg"),
  "building-materials": asset("portland_cement.jpg"),
  "solar-energy": asset("home_solar_system.jpg"),
  lighting: asset("floodlights.jpg"),
  landscaping: asset("pavers.jpg"),
};

const promotions = {
  "maxi-brick": asset("maxi_brick.jpg"),
  "solar-early-interest": asset("banner_solar.png"),
  "floodlight-offer": asset("floodlights.jpg"),
};

try {
  let productCount = 0;
  for (const [slug, images] of Object.entries(products)) {
    const result = await prisma.product.updateMany({
      where: { slug },
      data: { images: JSON.stringify(images) },
    });
    productCount += result.count;
  }

  let categoryCount = 0;
  for (const [slug, image] of Object.entries(categories)) {
    const result = await prisma.category.updateMany({
      where: { slug },
      data: { image },
    });
    categoryCount += result.count;
  }

  let promotionCount = 0;
  for (const [slug, image] of Object.entries(promotions)) {
    const result = await prisma.promotion.updateMany({
      where: { slug },
      data: { image },
    });
    promotionCount += result.count;
  }

  console.log(`Updated ${productCount} products, ${categoryCount} categories, ${promotionCount} promotions.`);
} finally {
  await prisma.$disconnect();
}
