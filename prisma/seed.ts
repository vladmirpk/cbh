import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { calculateDelivery } from "../lib/delivery";
import { CBH_CATEGORY, CBH_PRODUCT, CBH_PROMOTION, asset } from "../lib/cbh-images";

const prisma = new PrismaClient();
const pics = {
  brick: asset("face_brick.jpg"),
  wall: asset("common_brick.jpg"),
  site: asset("engineering_brick.jpg"),
  crew: asset("banner_bricks.png"),
  house: asset("interlocking_pavers.jpg"),
  house2: asset("charcoal_pavers_interlocking.jpg"),
  pool: asset("pool_coping.jpg"),
  light: asset("floodlights.jpg"),
  garden: asset("pavers.jpg"),
  solar: asset("home_solar_system.jpg"),
  roof: asset("home_solar_systems.jpg"),
  field: asset("solar_water_pump_kit.jpg"),
  yard: asset("portland_cement.jpg"),
  city: asset("kerbstone.jpg"),
  bannerSolar: asset("banner_solar.png"),
  bannerPavers: asset("banner_pavers_pool.png"),
};

const specs = (pairs: [string, string][]) => JSON.stringify(pairs.map(([label, value]) => ({ label, value })));
const photos = (...urls: string[]) => JSON.stringify(urls);

async function main() {
  await prisma.order.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.project.deleteMany();
  await prisma.post.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Cbh-Yard-2026", 10);
  const [admin, sales] = await Promise.all([
    prisma.user.create({ data: { name: "CBH Administrator", email: "admin@cbh.co.zw", passwordHash, role: "super_admin", phone: "+263 77 000 0000" } }),
    prisma.user.create({ data: { name: "Sales Desk", email: "sales@cbh.co.zw", passwordHash, role: "salesperson", phone: "+263 77 000 0001" } }),
  ]);
  await prisma.user.createMany({
    data: [
      { name: "CBH Management", email: "management@cbh.co.zw", passwordHash, role: "management" },
      { name: "Marketing Desk", email: "marketing@cbh.co.zw", passwordHash, role: "marketing" },
      { name: "Operations Desk", email: "operations@cbh.co.zw", passwordHash, role: "operations" },
    ],
  });

  const categoryData = [
    ["Bricks", "bricks", "Common, face and engineering bricks for walls that have to last a Harare season.", CBH_CATEGORY.bricks, 1],
    ["Pavers", "pavers", "Interlocking pavers for drives, yards and public walkways.", CBH_CATEGORY.pavers, 2],
    ["Kerbstones", "kerbstones", "Straight and mountable kerbs for roads, drives and parking.", CBH_CATEGORY.kerbstones, 3],
    ["Paver slabs", "paver-slabs", "Large-format slabs for paths, patios and pool surrounds.", CBH_CATEGORY["paver-slabs"], 4],
    ["Pool copings", "pool-copings", "Bullnose copings for residential and commercial pools.", CBH_CATEGORY["pool-copings"], 5],
    ["Building materials", "building-materials", "Cement, sand and the materials that sit beside the brick.", CBH_CATEGORY["building-materials"], 6],
    ["Solar & Energy", "solar-energy", "Panels, inverters, batteries and complete systems. Built to expand without a new website.", CBH_CATEGORY["solar-energy"], 7],
    ["Lighting", "lighting", "Yard, security and site lighting.", CBH_CATEGORY.lighting, 8],
    ["Landscaping", "landscaping", "Edging, cobbles and finishes around the building.", CBH_CATEGORY.landscaping, 9],
  ] as const;
  const categories = new Map<string, string>();
  for (const [name, slug, description, image, sortOrder] of categoryData) {
    const category = await prisma.category.create({ data: { name, slug, description, image, sortOrder } });
    categories.set(slug, category.id);
  }
  const cat = (slug: string) => categories.get(slug)!;

  await prisma.product.createMany({
    data: [
      product("CBH Common Brick", "cbh-common-brick", "CBH-BRK-001", "bricks", "The everyday clay brick for houses, boundary walls and infill. Priced per brick so a 10,000 load is easy to quote.", "brick", 0.11, null, 1000, "available", 2.4, true, "walls,residential", pics.wall, "222 × 106 × 73 mm|Size\n7 MPa|Compressive strength\nTerracotta|Colour", "cbh-face-brick,portland-cement-50kg", "Bricks in Harare | CBH Common Brick", "Common bricks from CBH with delivery quoted to your Harare suburb."),
      product("CBH Face Brick Rustic", "cbh-face-brick", "CBH-BRK-002", "bricks", "A face brick for walls that stay visible. Consistent colour and a cleaner arris than a common brick.", "brick", 0.28, null, 500, "available", 2.6, true, "walls,residential", pics.brick, "220 × 105 × 70 mm|Size\nThrough colour|Finish", "cbh-common-brick"),
      product("CBH Engineering Brick", "cbh-engineering-brick", "CBH-BRK-003", "bricks", "Denser brick for manholes, damp courses and work that takes load or moisture.", "brick", 0.35, null, 500, "available", 3.1, false, "commercial,heavy-duty", pics.site, "High density|Class\nLow absorption|Water", ""),
      product("CBH Maxi Brick", "cbh-maxi-brick", "CBH-BRK-004", "bricks", "A larger unit that covers wall faster. Currently on a yard promotion.", "brick", 0.18, 0.15, 500, "promotional", 3.4, true, "walls,promotional", pics.wall, "290 × 140 × 90 mm|Size", "cbh-common-brick"),
      product("Interlocking Paver 60mm Grey", "paver-60-grey", "CBH-PAV-060G", "pavers", "60 mm interlocking paver for driveways and domestic parking.", "paver", 0.42, null, 200, "available", 2.5, true, "driveway,residential", pics.house, "60 mm|Thickness\nGrey|Colour\nPedestrian and light vehicles|Application", "paver-60-charcoal"),
      product("Interlocking Paver 60mm Charcoal", "paver-60-charcoal", "CBH-PAV-060C", "pavers", "The same 60 mm paver in charcoal, used for borders and contrasting layouts.", "paver", 0.45, null, 200, "available", 2.5, false, "driveway,residential", pics.house2, "60 mm|Thickness\nCharcoal|Colour", "paver-60-grey"),
      product("Interlocking Paver 80mm Heavy Duty", "paver-80-heavy", "CBH-PAV-080", "pavers", "80 mm paver for yards that take trucks, forklifts and frequent turning.", "paver", 0.62, null, 200, "available", 3.4, true, "heavy-duty,commercial", pics.yard, "80 mm|Thickness\nHeavy traffic|Application", "kerbstone-1000"),
      product("Paver Slab 400×400", "paver-slab-400", "CBH-SLB-400", "paver-slabs", "A 400 mm slab for paths, stoeps and pool surrounds where a paver would look busy.", "slab", 4.5, null, 20, "available", 18, false, "residential,pool", pics.pool, "400 × 400 × 40 mm|Size", "pool-coping-bullnose"),
      product("Kerbstone 1000mm", "kerbstone-1000", "CBH-KRB-1000", "kerbstones", "Standard kerb for drives and internal roads. Sold per length.", "length", 6.8, null, 10, "available", 28, true, "roads,driveway", pics.city, "1000 mm|Length\nFigured for light vehicles|Duty", "paver-60-grey"),
      product("Mountable Kerb", "mountable-kerb", "CBH-KRB-MNT", "kerbstones", "A lower kerb that vehicles can cross, for parking bays and entrances.", "length", 8.2, null, 10, "available", 32, false, "commercial,driveway", pics.city, "Mountable profile|Profile", "kerbstone-1000"),
      product("Pool Coping Bullnose", "pool-coping-bullnose", "CBH-POL-001", "pool-copings", "Bullnose coping for the pool edge. Pair it with slabs for the surround.", "length", 7.4, null, 10, "available", 12, false, "pool,residential", pics.pool, "Bullnose|Profile", "paver-slab-400"),
      product("Portland Cement 50kg", "portland-cement-50kg", "CBH-CEM-050", "building-materials", "50 kg bags for mortar and concrete beside a brick delivery.", "bag", 12.5, null, 10, "available", 50, true, "mortar,residential", pics.yard, "50 kg|Pack", "cbh-common-brick,river-sand"),
      product("River Sand", "river-sand", "CBH-SND-RIV", "building-materials", "Washed river sand, quoted per cubic metre and delivered on the same truck plan as the bricks when the load allows.", "m³", 28, null, 1, "available", 1500, false, "mortar,residential", pics.site, "Per cubic metre|Unit", "portland-cement-50kg"),
      product("Pit Sand", "pit-sand", "CBH-SND-PIT", "building-materials", "Pit sand for bedding pavers and general fill.", "m³", 22, null, 1, "available", 1500, false, "paving,fill", pics.site, "Per cubic metre|Unit", "paver-60-grey"),
      product("CBH Solar Home Energy System", "cbh-solar-home", "CBH-SOL-HOME", "solar-energy", "A complete home system aimed at houses, farms and small businesses. Register interest before the January 2027 launch.", "system", 2850, null, 1, "coming_soon", 180, true, "energy,residential,farm", photos(pics.solar, pics.roof), "5 kVA class|Inverter\nBattery and panels sized to the brief|Storage\nInstallation quoted separately|Install", "", "Solar systems Zimbabwe | CBH Solar Home", "Register interest in the CBH solar home system launching in 2027."),
      product("550W Monocrystalline Panel", "panel-550w", "CBH-SOL-550", "solar-energy", "A 550 W panel for roof arrays. Sold as part of a designed system or on its own once stock lands.", "panel", 145, null, 2, "coming_soon", 28, false, "energy", pics.roof, "550 W|Power\nMonocrystalline|Cell", "cbh-solar-home", undefined, undefined, "2027-01-15"),
      product("5 kVA Hybrid Inverter", "inverter-5kva", "CBH-SOL-INV5", "solar-energy", "Hybrid inverter for homes that want solar, battery and grid in one board. Open for pre-order.", "unit", 980, null, 1, "pre_order", 22, true, "energy,residential", pics.field, "5 kVA|Rating\nHybrid|Type", "battery-5kwh", undefined, undefined, "2026-12-01"),
      product("5 kWh Lithium Battery", "battery-5kwh", "CBH-SOL-BAT5", "solar-energy", "A 5 kWh lithium battery for evening backup. Coming with the solar range.", "unit", 720, null, 1, "coming_soon", 55, false, "energy", pics.solar, "5 kWh|Capacity\nLithium|Chemistry", "inverter-5kva", undefined, undefined, "2027-01-15"),
      product("Solar Water Pump Kit", "solar-pump-kit", "CBH-SOL-PMP", "solar-energy", "A pump kit for small farms and gardens that want water without a diesel schedule.", "kit", 640, null, 1, "coming_soon", 35, false, "farm,energy", pics.field, "Farm and garden|Application", "panel-550w", undefined, undefined, "2027-03-01"),
      product("LED Floodlight 100W", "led-floodlight-100w", "CBH-LGT-100", "lighting", "A 100 W LED flood for yards and gatehouses. On promotion while the first container lasts.", "unit", 42, 35, 2, "promotional", 2.2, true, "outdoor,security", pics.light, "100 W|Power\nLED|Source", ""),
      product("Garden Edging", "garden-edging", "CBH-LND-EDG", "landscaping", "Edging to hold a lawn or a paver border in line.", "length", 3.2, null, 10, "available", 6, false, "garden", pics.garden, "Linear metre|Unit", "decorative-cobble"),
      product("Decorative Cobble", "decorative-cobble", "CBH-LND-COB", "landscaping", "Small cobbles for feature paths and courtyard joints.", "cobble", 0.55, null, 50, "available", 1.4, false, "garden,residential", pics.garden, "Mixed earth tones|Colour", "garden-edging"),
    ].map(({ categorySlug, ...item }) => ({ ...item, categoryId: cat(categorySlug) })),
  });

  const zones: [string, string, number, number, number][] = [
    ["Workington", "Central", 2, -17.835, 31.022],
    ["Southerton", "Central", 3, -17.848, 31.015],
    ["Mbare", "Central", 4, -17.845, 31.04],
    ["Harare CBD", "Central", 6, -17.829, 31.053],
    ["Willowvale", "West", 6, -17.855, 30.995],
    ["Avenues", "North", 7, -17.82, 31.045],
    ["Hatfield", "South", 8, -17.872, 31.078],
    ["Avondale", "North", 9, -17.804, 31.035],
    ["Highfield", "South", 9, -17.885, 30.99],
    ["Waterfalls", "South", 10, -17.89, 31.01],
    ["Msasa", "East", 11, -17.835, 31.115],
    ["Alexandra Park", "North", 11, -17.798, 31.065],
    ["Greendale", "East", 13, -17.812, 31.102],
    ["Highlands", "East", 12, -17.808, 31.078],
    ["Mount Pleasant", "North", 14, -17.778, 31.048],
    ["Budiriro", "West", 14, -17.89, 30.955],
    ["Glen View", "South", 13, -17.905, 30.98],
    ["Kuwadzana", "West", 16, -17.845, 30.94],
    ["Epworth", "East", 16, -17.89, 31.15],
    ["Borrowdale", "North", 18, -17.752, 31.09],
    ["Chitungwiza", "Towns", 20, -18.0, 31.07],
    ["Ruwa", "Towns", 24, -17.89, 31.245],
    ["Norton", "Towns", 38, -17.883, 30.7],
  ];
  await prisma.zone.createMany({
    data: zones.map(([name, area, distanceKm, lat, lng]) => ({ name, area, distanceKm, lat, lng })),
  });
  await prisma.vehicle.createMany({
    data: [
      { name: "1 tonne bakkie", capacityKg: 1000, surcharge: 0, sortOrder: 1 },
      { name: "3 tonne truck", capacityKg: 3000, surcharge: 18, sortOrder: 2 },
      { name: "7 tonne truck", capacityKg: 7000, surcharge: 40, sortOrder: 3 },
      { name: "15 tonne truck", capacityKg: 15000, surcharge: 70, sortOrder: 4 },
      { name: "30 tonne truck", capacityKg: 30000, surcharge: 100, sortOrder: 5 },
    ],
  });
  await prisma.deliverySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      depotName: "Workington yard",
      depotAddress: "Workington Industrial Area, Harare",
      depotLat: -17.835,
      depotLng: 31.022,
      baseCharge: 30,
      perKm: 1.5,
      minCharge: 40,
      fuelSurchargePct: 5,
      roadFactor: 1.28,
      extraCharge: 0,
    },
  });
  const disclaimer = "This is a provisional quotation. Final delivery charges are subject to confirmation by CBH based on vehicle availability, exact delivery location, road conditions, load requirements and other applicable factors.";
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      phone: "+263 242 123 456",
      whatsapp: "+263 77 000 0000",
      email: "sales@cbh.co.zw",
      address: "Stand 123, Gweru Road, Harare",
      hours: "Mon–Fri 07:30–16:30 · Sat 07:30–13:00",
      validityDays: 7,
      disclaimer,
      about: "Consolidated Bricks & Hardware supplies the materials a Zimbabwean build actually uses: bricks and pavers first, then the cement, kerbs, lighting and — from 2027 — solar and energy systems.\n\nThis platform is the sales desk. A customer can see a product, price a quantity to their suburb, and leave a lead that a salesperson can follow to a formal quote, an order and a delivery. New product lines are added in the catalogue. The site does not have to be rebuilt when the yard grows.",
    },
  });

  await prisma.promotion.createMany({
    data: [
      { title: "Maxi brick promotion", slug: "maxi-brick", headline: "Maxi bricks, while the promotion holds.", description: "A larger brick at a promotional unit price. Quote the quantity and the suburb together.", image: CBH_PROMOTION["maxi-brick"], priceLabel: "US$0.15 / brick", discount: "Yard promotion", cta: "quote", ctaHref: "/quote?product=cbh-maxi-brick", targetArea: "Harare", audience: "Home builders", active: true },
      { title: "Solar early interest", slug: "solar-early-interest", headline: "CBH Solar & Energy. Launching soon.", description: "Reliable energy conversations for homes, farms and businesses — before the stock lands.", image: CBH_PROMOTION["solar-early-interest"], discount: "Register interest", cta: "interest", ctaHref: "/launch/cbh-solar-home", targetArea: "Harare and towns", audience: "Homeowners and farms", active: true },
      { title: "Floodlight offer", slug: "floodlight-offer", headline: "100 W LED floods for the gate.", description: "Security lighting at the promotional price. Ask on WhatsApp if you need a count for a site.", image: CBH_PROMOTION["floodlight-offer"], priceLabel: "US$35", discount: "Promotional", cta: "whatsapp", ctaHref: "/products/led-floodlight-100w", targetArea: "Harare", audience: "Home and commercial", active: true },
    ],
  });
  await prisma.project.createMany({
    data: [
      { name: "Residential development — Hatfield", slug: "hatfield-residential", location: "Hatfield, Harare", contractor: "Sample Builders", products: "Common bricks, 60 mm pavers, kerbstones", quantity: "100,000 bricks · 5,000 pavers · kerbs to the road edge", photos: photos(pics.house, pics.crew), description: "A residential scheme supplied from the Workington yard. Bricks for the superstructure, pavers for the internal roads, kerbs to the boundary.", status: "completed", featured: true },
      { name: "School block — Chitungwiza", slug: "chitungwiza-school", location: "Chitungwiza", contractor: "Sample Contractors", products: "Common bricks, cement, river sand", quantity: "Classroom block, in progress", photos: photos(pics.site), description: "An active school block. Deliveries are staged so the site is not holding more brick than it can lay.", status: "in_progress", featured: true },
      { name: "Commercial yard — Msasa", slug: "msasa-yard", location: "Msasa, Harare", contractor: "Sample Logistics", products: "80 mm heavy-duty pavers, mountable kerbs", quantity: "Truck yard", photos: photos(pics.yard), description: "A hard-standing yard specified for turning trucks, not domestic cars.", status: "completed", featured: true },
    ],
  });
  await prisma.post.createMany({
    data: [
      { title: "What a provisional delivery price actually means", slug: "provisional-delivery-prices", excerpt: "The number on the website is for a decision. The formal quote still checks the road.", kind: "blog", image: pics.yard, body: "CBH prices delivery from a rate card: a base charge, a distance from the Workington yard, the truck the load needs, and a fuel factor.\n\nThat lets a builder in Hatfield see a figure before phoning the yard. It is not a promise that ignores a flooded side road or a truck already committed. The quotation says so, in plain language, and a salesperson confirms the formal price." },
      { title: "Solar and energy joins the yard in 2027", slug: "solar-joins-the-yard", excerpt: "Panels, inverters, batteries and complete systems will sit beside bricks. Interest is open now.", kind: "news", image: pics.solar, body: "CBH is preparing a solar and energy range for homes, farms and small businesses. The products are on the site as coming soon so demand can be counted before the container is ordered.\n\nRegister interest with a location and a rough quantity. The lead lands on the same desk as a brick enquiry." },
      { title: "Choosing pavers for a Harare driveway", slug: "pavers-for-a-driveway", excerpt: "60 mm for the family car. 80 mm when the bakkie is not the heaviest thing that will turn.", kind: "blog", image: pics.house, body: "A domestic drive is usually a 60 mm interlocking paver. A yard that takes delivery trucks needs the 80 mm heavy-duty unit, and a kerb that can be crossed where vehicles enter.\n\nQuote both if you are unsure. The delivery engine sizes the truck from the weight, not from a guess." },
    ],
  });
  await prisma.faq.createMany({
    data: [
      { question: "Is the delivery price final?", answer: "No. It is a provisional estimate from the current rate card. CBH confirms the final charge against the exact gate, the road, the vehicle and the load.", sortOrder: 1 },
      { question: "Can I quote a product that is not in stock yet?", answer: "Coming soon and pre-order products can take an interest registration or a provisional figure marked with that status. Discontinued products cannot be quoted.", sortOrder: 2 },
      { question: "Do you sell only bricks?", answer: "No. The catalogue already includes pavers, kerbs, slabs, cement, sand, lighting and landscaping, and it is ready for solar without a rebuild.", sortOrder: 3 },
      { question: "Can a contractor open an account?", answer: "Yes. The contact form records the company, a contact, typical volume and any credit request. Limits and statements are the next commercial phase.", sortOrder: 4 },
    ],
  });

  const brick = await prisma.product.findUnique({ where: { sku: "CBH-BRK-001" } });
  const solar = await prisma.product.findUnique({ where: { sku: "CBH-SOL-HOME" } });
  const paver = await prisma.product.findUnique({ where: { sku: "CBH-PAV-060G" } });
  const hatfield = await prisma.zone.findFirst({ where: { name: "Hatfield" } });
  const vehicles = await prisma.vehicle.findMany();
  if (brick && hatfield) {
    const quantity = 10000;
    const breakdown = calculateDelivery({
      quantity,
      weightKgEach: brick.weightKg,
      distanceKm: hatfield.distanceKm,
      rates: { baseCharge: 30, perKm: 1.5, minCharge: 40, fuelSurchargePct: 5, roadFactor: 1.28, extraCharge: 0 },
      vehicles,
    });
    const productTotal = Math.round(brick.price * quantity * 100) / 100;
    const total = Math.round((productTotal + breakdown.deliveryCost) * 100) / 100;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lead = await prisma.lead.create({
      data: {
        name: "Sample Customer",
        phone: "+263 77 100 0001",
        whatsapp: "+263 77 100 0001",
        email: "sample.customer@example.com",
        location: "Sample stand, Hatfield",
        productId: brick.id,
        productName: brick.name,
        quantity,
        quoteValue: total,
        status: "quoted",
        source: "website",
        assignedToId: sales.id,
        followUpDate: tomorrow.toISOString().slice(0, 10),
      },
    });
    await prisma.quote.create({
      data: {
        number: "CBH-2026-0001",
        publicToken: randomBytes(9).toString("hex"),
        leadId: lead.id,
        customerName: lead.name,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        location: lead.location,
        zoneName: "Hatfield",
        distanceKm: hatfield.distanceKm,
        distanceMethod: "zone",
        productId: brick.id,
        productName: brick.name,
        sku: brick.sku,
        quantity,
        unit: brick.unit,
        unitPrice: brick.price,
        productTotal,
        deliveryCost: breakdown.deliveryCost,
        total,
        validDays: 7,
        breakdown: JSON.stringify(breakdown),
        disclaimer,
      },
    });
    await prisma.leadNote.create({
      data: { leadId: lead.id, authorId: admin.id, authorName: admin.name, body: "Sample lead so the desk is not empty. Replace it with a real enquiry." },
    });
  }
  if (solar) {
    await prisma.lead.create({
      data: {
        name: "Sample Contractor",
        phone: "+263 77 100 0002",
        whatsapp: "+263 77 100 0002",
        location: "Ruwa",
        company: "Sample Builders",
        customerType: "contractor",
        monthlyVolume: "One homestead system a month",
        productId: solar.id,
        productName: solar.name,
        quantity: 1,
        status: "new",
        source: "upcoming",
      },
    });
  }
  if (paver) {
    await prisma.lead.create({
      data: {
        name: "Sample Homeowner",
        phone: "+263 77 100 0003",
        location: "Borrowdale",
        productId: paver.id,
        productName: paver.name,
        quantity: 800,
        quoteValue: 336,
        status: "won",
        source: "facebook",
        assignedToId: sales.id,
      },
    });
  }
  await prisma.notification.create({
    data: { title: "Desk is ready", body: "Update the WhatsApp number and passwords before this site is shared.", href: "/admin/settings" },
  });
}

function product(
  name: string,
  slug: string,
  sku: string,
  categorySlug: string,
  description: string,
  unit: string,
  price: number,
  promoPrice: number | null,
  moq: number,
  stockStatus: string,
  weightKg: number,
  featured: boolean,
  tags: string,
  images: string,
  specText: string,
  relatedSlugs: string,
  seoTitle?: string,
  seoDescription?: string,
  launchDate?: string,
) {
  const parsed = specText.split("\n").filter(Boolean).map((line) => {
    const [value, label] = line.split("|");
    return { label, value };
  });
  const byLabel = (label: string) => parsed.find((spec) => spec.label?.toLowerCase() === label.toLowerCase())?.value ?? null;
  const colour = byLabel("Colour") || byLabel("Finish");
  const sizeLabel =
    byLabel("Size") ||
    byLabel("Thickness") ||
    byLabel("Length") ||
    byLabel("Pack") ||
    byLabel("Power") ||
    byLabel("Rating") ||
    byLabel("Capacity");
  const packSize = byLabel("Pack");
  const features = [
    colour ? `Finish / colour: ${colour}` : null,
    sizeLabel ? `Sized at ${sizeLabel}` : null,
    stockStatus === "promotional" ? "Currently on a yard promotion" : null,
    categorySlug === "solar-energy" ? "Part of the CBH Solar & Energy range" : null,
    "Quoted with delivery from the Workington yard",
  ].filter(Boolean) as string[];
  const useCase =
    categorySlug === "bricks"
      ? "Used for walls, boundary work and infill. Quote by brick count so a full load is easy to price with delivery."
      : categorySlug === "pavers"
        ? "Laid for driveways, yards and walkways. Choose thickness for domestic cars or truck traffic."
        : categorySlug === "solar-energy"
          ? "Specified for homes, farms and small businesses that want solar, backup or a full system — register interest or pre-order before stock lands."
          : categorySlug === "lighting"
            ? "Outdoor and site lighting for yards, gates and security coverage."
            : "Building materials and finishes supplied from the CBH yard with a provisional delivery quote.";
  const onOrder = stockStatus === "pre_order" || stockStatus === "coming_soon";
  return {
    name, slug, sku, categorySlug, description, unit, price, promoPrice, moq, stockStatus, weightKg, featured, tags,
    specs: JSON.stringify(parsed),
    relatedSlugs,
    seoTitle: seoTitle ?? null,
    seoDescription: seoDescription ?? null,
    images: CBH_PRODUCT[slug]
      ? JSON.stringify(CBH_PRODUCT[slug])
      : images.startsWith("[")
        ? images
        : JSON.stringify([images]),
    launchDate: launchDate ?? (stockStatus === "coming_soon" ? "2027-01-15" : null),
    installRequired: categorySlug === "solar-energy",
    active: true,
    brand: "CBH",
    modelNumber: sku,
    colour,
    sizeLabel,
    packSize,
    stockQty: onOrder ? null : stockStatus === "promotional" ? 1200 : 5000,
    leadTimeDays: stockStatus === "pre_order" ? 14 : stockStatus === "coming_soon" ? 45 : null,
    leadTimeNote: stockStatus === "pre_order"
      ? "Pre-order · confirm lead time with sales"
      : stockStatus === "coming_soon"
        ? "Coming soon · register interest"
        : null,
    useCase,
    features: JSON.stringify(features),
    warranty: categorySlug === "solar-energy" ? "Manufacturer warranty, confirmed at launch" : null,
    deliveryNotes: weightKg > 20 ? "Heavy unit. The quote selects a truck from the weight." : "Included in the provisional delivery calculation.",
  };
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
