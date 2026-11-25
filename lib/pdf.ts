import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatDate, addDays, money, formatQty } from "./format";
import type { DeliveryBreakdown } from "./delivery";
import { quoteLinesFrom, type QuoteLine } from "./types";
import { drawLetterhead } from "./pdf-brand";

export type PdfQuote = {
  number: string;
  createdAt: Date;
  validDays: number;
  customerName: string;
  phone: string;
  email?: string | null;
  location: string;
  zoneName?: string | null;
  distanceKm: number;
  productName: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  productTotal: number;
  deliveryCost: number;
  total: number;
  items?: string | null;
  breakdown: DeliveryBreakdown;
  disclaimer: string;
};

export type PdfCompany = {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
};

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawRow(page: PDFPage, y: number, cols: [string, string], bold = false, font: PDFFont, strong: PDFFont) {
  const used = bold ? strong : font;
  page.drawText(cols[0], { x: 48, y, size: 11, font: used, color: rgb(0.11, 0.09, 0.07) });
  const width = used.widthOfTextAtSize(cols[1], 11);
  page.drawText(cols[1], { x: 547 - width, y, size: 11, font: used, color: rgb(0.11, 0.09, 0.07) });
}

export async function buildQuotePdf(quote: PdfQuote, company: PdfCompany) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const strong = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = await drawLetterhead(pdf, page, { regular: font, bold: strong }, "Provisional quotation", quote.number);
  y -= 8;
  const meta = [
    `Date  ${formatDate(quote.createdAt)}`,
    `Valid until  ${formatDate(addDays(quote.createdAt, quote.validDays))}`,
    `Customer  ${quote.customerName}`,
    `Phone  ${quote.phone}`,
    quote.email ? `Email  ${quote.email}` : "",
    `Location  ${quote.location}`,
    quote.zoneName ? `Zone  ${quote.zoneName} · ${quote.distanceKm} km from dispatch` : "",
  ].filter(Boolean);
  for (const line of meta) {
    page.drawText(line, { x: 48, y, size: 11, font, color: rgb(0.2, 0.16, 0.13) });
    y -= 18;
  }

  y -= 16;
  page.drawRectangle({ x: 48, y: y - 8, width: 499, height: 28, color: rgb(0.95, 0.93, 0.9) });
  page.drawText("Description", { x: 56, y: y, size: 10, font: strong, color: rgb(0.35, 0.3, 0.26) });
  page.drawText("Amount", { x: 480, y: y, size: 10, font: strong, color: rgb(0.35, 0.3, 0.26) });
  y -= 32;
  const lines: QuoteLine[] = quoteLinesFrom(quote);
  for (const item of lines) {
    const productLine = `${item.productName}${item.sku ? ` (${item.sku})` : ""} · ${formatQty(item.quantity)} ${item.unit} @ ${money(item.unitPrice)}`;
    const wrapped = wrap(productLine, font, 11, 360);
    const startY = y;
    for (const line of wrapped) {
      page.drawText(line, { x: 48, y, size: 11, font, color: rgb(0.11, 0.09, 0.07) });
      y -= 16;
    }
    const productAmount = money(item.lineTotal);
    page.drawText(productAmount, {
      x: 547 - strong.widthOfTextAtSize(productAmount, 11),
      y: startY,
      size: 11,
      font: strong,
      color: rgb(0.11, 0.09, 0.07),
    });
    y -= 6;
  }
  y -= 2;
  drawRow(page, y, ["Estimated delivery", money(quote.deliveryCost)], false, font, strong);
  y -= 16;
  page.drawText(
    `${quote.breakdown.vehicle} · ${quote.breakdown.trips} trip${quote.breakdown.trips === 1 ? "" : "s"} · ${quote.breakdown.weightKg} kg`,
    { x: 48, y, size: 9, font, color: rgb(0.4, 0.36, 0.32) },
  );
  y -= 28;
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 1, color: rgb(0.85, 0.8, 0.74) });
  y -= 22;
  drawRow(page, y, ["Total provisional estimate", money(quote.total)], true, font, strong);

  y -= 36;
  page.drawText("How delivery was estimated", { x: 48, y, size: 10, font: strong, color: rgb(0.11, 0.09, 0.07) });
  y -= 16;
  const formula = `Base ${money(quote.breakdown.baseCharge)} + distance ${money(quote.breakdown.distanceCharge)} ${quote.breakdown.minApplied ? "(minimum charge applied)" : ""} + vehicle ${money(quote.breakdown.vehicleSurcharge)} × ${quote.breakdown.trips}, fuel ${money(quote.breakdown.fuelAmount)}, extras ${money(quote.breakdown.extraCharge)}.`;
  for (const line of wrap(formula, font, 9, 500)) {
    page.drawText(line, { x: 48, y, size: 9, font, color: rgb(0.35, 0.3, 0.26) });
    y -= 13;
  }

  y -= 18;
  for (const line of wrap(quote.disclaimer, font, 9, 500)) {
    page.drawText(line, { x: 48, y, size: 9, font, color: rgb(0.45, 0.28, 0.16) });
    y -= 13;
  }

  page.drawText(`${company.address}  ·  ${company.phone}  ·  ${company.email}`, {
    x: 48,
    y: 42,
    size: 9,
    font,
    color: rgb(0.4, 0.36, 0.32),
  });
  page.drawText(`WhatsApp ${company.whatsapp}`, {
    x: 48,
    y: 28,
    size: 9,
    font,
    color: rgb(0.4, 0.36, 0.32),
  });
  return pdf.save();
}

export type PdfOrder = {
  number: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  email?: string | null;
  location: string;
  items: string;
  total: number;
  status: string;
  paymentStatus: string;
  vehicle?: string | null;
  driver?: string | null;
  deliveryDate?: string | null;
  notes?: string | null;
};

export async function buildOrderPdf(order: PdfOrder, company: PdfCompany) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const strong = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = await drawLetterhead(pdf, page, { regular: font, bold: strong }, "Delivery / order note", order.number);
  y -= 8;
  page.drawText(order.number, { x: 48, y, size: 14, font: strong, color: rgb(0.11, 0.09, 0.07) });
  page.drawText(formatDate(order.createdAt), { x: 420, y, size: 11, font, color: rgb(0.4, 0.36, 0.32) });
  y -= 28;
  page.drawText(order.customerName, { x: 48, y, size: 12, font: strong });
  y -= 16;
  page.drawText(`${order.phone}${order.email ? `  ·  ${order.email}` : ""}`, { x: 48, y, size: 10, font });
  y -= 16;
  for (const line of wrap(order.location, font, 10, 500)) {
    page.drawText(line, { x: 48, y, size: 10, font });
    y -= 14;
  }
  y -= 10;
  drawRow(page, y, ["Status", `${order.status.replace(/_/g, " ")} · ${order.paymentStatus}`], true, font, strong);
  y -= 18;
  if (order.vehicle || order.driver) {
    drawRow(page, y, ["Fleet", [order.vehicle, order.driver].filter(Boolean).join(" · ")], false, font, strong);
    y -= 18;
  }
  if (order.deliveryDate) {
    drawRow(page, y, ["Delivery date", order.deliveryDate], false, font, strong);
    y -= 18;
  }
  y -= 8;
  page.drawText("Items", { x: 48, y, size: 12, font: strong });
  y -= 18;
  const lines = parseOrderLines(order.items);
  for (const line of lines) {
    const label = `${line.product}${line.quantity ? ` · ${formatQty(line.quantity)}${line.unit ? ` ${line.unit}` : ""}` : ""}`;
    drawRow(page, y, [label.slice(0, 58), line.total != null ? money(line.total) : ""], false, font, strong);
    y -= 16;
    if (y < 120) break;
  }
  y -= 8;
  drawRow(page, y, ["Order total", money(order.total)], true, font, strong);
  y -= 28;
  if (order.notes) {
    page.drawText("Notes", { x: 48, y, size: 11, font: strong });
    y -= 16;
    for (const line of wrap(order.notes, font, 10, 500)) {
      page.drawText(line, { x: 48, y, size: 10, font, color: rgb(0.4, 0.36, 0.32) });
      y -= 13;
    }
  }
  page.drawText(`${company.address}  ·  ${company.phone}  ·  ${company.email}`, {
    x: 48,
    y: 42,
    size: 9,
    font,
    color: rgb(0.4, 0.36, 0.32),
  });
  page.drawText(`WhatsApp ${company.whatsapp}`, {
    x: 48,
    y: 28,
    size: 9,
    font,
    color: rgb(0.4, 0.36, 0.32),
  });
  return pdf.save();
}

function parseOrderLines(raw: string): Array<{ product: string; quantity?: number; unit?: string; total?: number }> {
  try {
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed) || !parsed.length) return [{ product: "Materials" }];
    return parsed.map((item) => ({
      product: String(item.productName ?? item.product ?? "Item"),
      quantity: typeof item.quantity === "number" ? item.quantity : undefined,
      unit: typeof item.unit === "string" ? item.unit : undefined,
      total: typeof item.lineTotal === "number" ? item.lineTotal : typeof item.total === "number" ? item.total : undefined,
    }));
  } catch {
    return [{ product: raw || "Materials" }];
  }
}
