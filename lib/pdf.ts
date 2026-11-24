import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatDate, addDays, money, formatQty } from "./format";
import type { DeliveryBreakdown } from "./delivery";
import { quoteLinesFrom, type QuoteLine } from "./types";

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
  page.drawRectangle({ x: 0, y: 770, width: 595, height: 72, color: rgb(0.11, 0.09, 0.07) });
  page.drawRectangle({ x: 0, y: 766, width: 595, height: 4, color: rgb(0.76, 0.25, 0.05) });
  page.drawText("CONSOLIDATED BRICKS & HARDWARE", {
    x: 48,
    y: 808,
    size: 11,
    font: strong,
    color: rgb(0.96, 0.93, 0.89),
  });
  page.drawText("Provisional quotation", {
    x: 48,
    y: 786,
    size: 18,
    font: strong,
    color: rgb(1, 1, 1),
  });
  page.drawText(quote.number, {
    x: 430,
    y: 800,
    size: 12,
    font: strong,
    color: rgb(0.95, 0.72, 0.55),
  });

  let y = 730;
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
