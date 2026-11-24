"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { calculateDelivery, haversineKm, nearestZone, roadKm, round2 } from "../delivery";
import { ratesFrom } from "../queries";
import { notify, audit } from "../notify";
import { rateLimit } from "../rate-limit";
import { formatQty, money } from "../format";
import { LEAD_SOURCES, type FormState, num, str, unitPrice } from "../types";

async function guard(bucket: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`${bucket}:${ip}`)) {
    return "Too many requests. Please wait a minute and try again.";
  }
  return null;
}

function cleanSource(value: string) {
  const source = value.toLowerCase();
  return (LEAD_SOURCES as readonly string[]).includes(source) ? source : "website";
}

export async function createQuote(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard("quote");
  if (blocked) return { error: blocked };

  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const whatsapp = str(formData, "whatsapp") || phone;
  const email = str(formData, "email");
  const address = str(formData, "address");
  const zoneId = str(formData, "zoneId");
  const method = str(formData, "method");
  const lat = num(formData, "lat");
  const lng = num(formData, "lng");
  const source = cleanSource(str(formData, "source") || "website");
  const requirements = str(formData, "requirements");
  const requiredDate = str(formData, "requiredDate");
  const customerType = str(formData, "customerType") === "contractor" ? "contractor" : "retail";
  const company = str(formData, "company");

  if (name.length < 2) return { error: "Enter the name CBH should ask for." };
  if (phone.replace(/\D/g, "").length < 7) return { error: "Enter a phone number we can call." };

  type IncomingLine = { productId: string; quantity: number };
  let requested: IncomingLine[] = [];
  const rawItems = str(formData, "items");
  if (rawItems) {
    try {
      const parsed = JSON.parse(rawItems) as Array<{ productId?: string; quantity?: number }>;
      requested = parsed
        .map((line) => ({ productId: String(line.productId || ""), quantity: Number(line.quantity) }))
        .filter((line) => line.productId && Number.isFinite(line.quantity) && line.quantity > 0);
    } catch {
      return { error: "The quote basket could not be read. Add the products again." };
    }
  } else {
    const productId = str(formData, "productId");
    const quantity = num(formData, "quantity");
    if (productId && Number.isFinite(quantity) && quantity > 0) {
      requested = [{ productId, quantity }];
    }
  }
  if (!requested.length) return { error: "Add at least one product to the quote." };

  const [catalog, settings, site, vehicles, zones] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: requested.map((line) => line.productId) }, active: true },
    }),
    prisma.deliverySettings.findUnique({ where: { id: "default" } }),
    prisma.siteSetting.findUnique({ where: { id: "default" } }),
    prisma.vehicle.findMany({ where: { active: true } }),
    prisma.zone.findMany({ where: { active: true } }),
  ]);
  if (!settings || !site) return { error: "Quotation settings are not ready yet." };

  const byId = new Map(catalog.map((product) => [product.id, product]));
  const lines = [];
  for (const request of requested) {
    const product = byId.get(request.productId);
    if (!product) return { error: "One of the products is no longer available." };
    if (product.stockStatus === "discontinued") return { error: `${product.name} has been discontinued.` };
    if (request.quantity < product.moq) {
      return { error: `Minimum order for ${product.name} is ${product.moq} ${product.unit}.` };
    }
    const price = unitPrice(product);
    lines.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: request.quantity,
      unit: product.unit,
      unitPrice: price,
      lineTotal: round2(price * request.quantity),
      weightKg: round2(product.weightKg * request.quantity),
    });
  }

  const zone = zones.find((item) => item.id === zoneId);
  let distanceKm = zone?.distanceKm ?? 0;
  let zoneName = zone?.name ?? "";
  let distanceMethod = "zone";
  if (method === "pin" && Number.isFinite(lat) && Number.isFinite(lng)) {
    distanceKm = roadKm(
      haversineKm({ lat: settings.depotLat, lng: settings.depotLng }, { lat, lng }),
      settings.roadFactor,
    );
    distanceMethod = "pin";
    if (zones.length) {
      zoneName = nearestZone(zones, lat, lng).name;
    }
  }
  if (!zone && distanceMethod !== "pin") return { error: "Choose a suburb or drop a pin so delivery can be estimated." };
  if (distanceKm <= 0) return { error: "Choose a delivery location." };

  const productTotal = round2(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const weightKg = round2(lines.reduce((sum, line) => sum + line.weightKg, 0));
  const breakdown = calculateDelivery({
    weightKg,
    distanceKm,
    rates: ratesFrom(settings),
    vehicles,
  });
  const total = round2(productTotal + breakdown.deliveryCost);
  const location = [address, zoneName].filter(Boolean).join(", ") || zoneName;
  const count = await prisma.quote.count();
  const number = `CBH-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const publicToken = randomBytes(9).toString("hex");
  const primary = lines[0];
  const summaryName =
    lines.length === 1
      ? primary.productName
      : `${primary.productName} + ${lines.length - 1} more`;
  const summaryQty = lines.reduce((sum, line) => sum + line.quantity, 0);

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      whatsapp,
      email: email || null,
      location,
      company: company || null,
      customerType,
      productId: primary.productId,
      productName: summaryName,
      quantity: summaryQty,
      requirements: [
        requirements,
        lines.map((line) => `${formatQty(line.quantity)} ${line.unit} ${line.productName}`).join("; "),
      ]
        .filter(Boolean)
        .join("\n"),
      requiredDate: requiredDate || null,
      quoteValue: total,
      status: "quoted",
      source,
    },
  });
  await prisma.quote.create({
    data: {
      number,
      publicToken,
      leadId: lead.id,
      customerName: name,
      phone,
      whatsapp,
      email: email || null,
      location,
      zoneName,
      distanceKm: breakdown.distanceKm,
      distanceMethod,
      productId: primary.productId,
      productName: summaryName,
      sku: primary.sku,
      quantity: summaryQty,
      unit: lines.length === 1 ? primary.unit : "items",
      unitPrice: lines.length === 1 ? primary.unitPrice : productTotal,
      productTotal,
      deliveryCost: breakdown.deliveryCost,
      total,
      items: JSON.stringify(lines),
      validDays: site.validityDays,
      breakdown: JSON.stringify(breakdown),
      disclaimer: site.disclaimer,
    },
  });
  await Promise.all(
    lines.map((line) =>
      prisma.product.update({ where: { id: line.productId }, data: { enquiries: { increment: 1 } } }),
    ),
  );
  await notify(
    `Quote ${number}`,
    `${name} requested ${lines.length} product${lines.length === 1 ? "" : "s"} to ${location}. Provisional total ${money(total)}.`,
    `/admin/leads/${lead.id}`,
  );
  await audit("create", "quote", number, `${name} · ${summaryName}`, name);
  redirect(`/q/${publicToken}`);
}

export async function registerInterest(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard("interest");
  if (blocked) return { error: blocked };
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const whatsapp = str(formData, "whatsapp") || phone;
  const email = str(formData, "email");
  const location = str(formData, "location");
  const productId = str(formData, "productId");
  const quantity = num(formData, "quantity");
  const requirements = str(formData, "requirements");
  const source = cleanSource(str(formData, "source") || "upcoming");
  if (name.length < 2 || phone.replace(/\D/g, "").length < 7 || location.length < 2) {
    return { error: "Name, phone and location are required." };
  }
  const product = productId
    ? await prisma.product.findFirst({ where: { id: productId, active: true } })
    : null;
  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      whatsapp,
      email: email || null,
      location,
      productId: product?.id,
      productName: product?.name || str(formData, "productName") || "Upcoming product",
      quantity: Number.isFinite(quantity) ? quantity : null,
      requirements: requirements || null,
      status: "new",
      source,
    },
  });
  if (product) {
    await prisma.product.update({ where: { id: product.id }, data: { enquiries: { increment: 1 } } });
  }
  await notify(
    "Interest registered",
    `${name} wants to hear about ${product?.name || "a new product"} in ${location}.`,
    `/admin/leads/${lead.id}`,
  );
  await audit("create", "lead", lead.id, "interest", name);
  return { success: "Interest registered. A CBH salesperson will contact you when this product moves." };
}

export async function sendEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard("enquiry");
  if (blocked) return { error: blocked };
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const whatsapp = str(formData, "whatsapp") || phone;
  const email = str(formData, "email");
  const location = str(formData, "location");
  const quantity = num(formData, "quantity");
  const requirements = str(formData, "requirements");
  const requiredDate = str(formData, "requiredDate");
  const productId = str(formData, "productId");
  const source = cleanSource(str(formData, "source") || "website");
  const customerType = str(formData, "customerType") === "contractor" ? "contractor" : "retail";
  if (name.length < 2 || phone.replace(/\D/g, "").length < 7) {
    return { error: "Name and phone are required." };
  }
  const product = productId ? await prisma.product.findFirst({ where: { id: productId } }) : null;
  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      whatsapp,
      email: email || null,
      location: location || "Not specified",
      company: str(formData, "company") || null,
      customerType,
      registration: str(formData, "registration") || null,
      monthlyVolume: str(formData, "monthlyVolume") || null,
      creditRequest: str(formData, "creditRequest") || null,
      productId: product?.id,
      productName: product?.name || str(formData, "topic") || "General enquiry",
      quantity: Number.isFinite(quantity) ? quantity : null,
      requirements: requirements || null,
      requiredDate: requiredDate || null,
      status: "new",
      source,
    },
  });
  if (product) {
    await prisma.product.update({ where: { id: product.id }, data: { enquiries: { increment: 1 } } });
  }
  await notify("New enquiry", `${name} · ${lead.productName} · ${lead.location}`, `/admin/leads/${lead.id}`);
  await audit("create", "lead", lead.id, source, name);
  return { success: "Enquiry received. It is now in the CBH sales queue." };
}

export async function requestOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard("order");
  if (blocked) return { error: blocked };
  const token = str(formData, "token");
  const quote = await prisma.quote.findUnique({ where: { publicToken: token } });
  if (!quote) return { error: "Quotation not found." };
  const existing = await prisma.order.findFirst({ where: { quoteId: quote.id } });
  if (existing) return { success: `Order ${existing.number} is already with the CBH team.` };
  const count = await prisma.order.count();
  const number = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const order = await prisma.order.create({
    data: {
      number,
      quoteId: quote.id,
      leadId: quote.leadId,
      customerName: quote.customerName,
      phone: quote.phone,
      email: quote.email,
      location: quote.location,
      items: quote.items && quote.items !== "[]"
        ? quote.items
        : JSON.stringify([
            {
              product: quote.productName,
              sku: quote.sku,
              quantity: quote.quantity,
              unit: quote.unit,
              total: quote.productTotal,
            },
          ]),
      total: quote.total,
      vehicle: JSON.parse(quote.breakdown).vehicle,
      status: "requested",
    },
  });
  if (quote.leadId) {
    await prisma.lead.update({
      where: { id: quote.leadId },
      data: { status: "negotiating" },
    });
    await prisma.leadNote.create({
      data: {
        leadId: quote.leadId,
        authorName: "Website",
        body: `Customer requested order ${number} from quotation ${quote.number}.`,
      },
    });
  }
  await notify("Order requested", `${quote.customerName} wants to proceed with ${quote.number}.`, `/admin/orders`);
  await audit("create", "order", order.id, number, quote.customerName);
  return { success: `Order request ${number} is with CBH. Payment is arranged with your salesperson — online checkout is the next phase.` };
}
