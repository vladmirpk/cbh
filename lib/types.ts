export const PRODUCT_STATUSES = [
  { id: "available", label: "Available" },
  { id: "coming_soon", label: "Coming soon" },
  { id: "pre_order", label: "Pre-order" },
  { id: "out_of_stock", label: "Out of stock" },
  { id: "unavailable", label: "Temporarily unavailable" },
  { id: "discontinued", label: "Discontinued" },
  { id: "promotional", label: "Promotional" },
] as const;

export const LEAD_STATUSES = [
  { id: "new", label: "New lead" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "negotiating", label: "Negotiating" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export const LEAD_SOURCES = [
  "website",
  "google",
  "whatsapp",
  "facebook",
  "instagram",
  "tiktok",
  "linkedin",
  "advertisement",
  "referral",
  "direct",
  "launch",
  "upcoming",
] as const;

export const ORDER_STATUSES = [
  { id: "requested", label: "Requested" },
  { id: "confirmed", label: "Confirmed" },
  { id: "loading", label: "Loading" },
  { id: "dispatched", label: "Dispatched" },
  { id: "in_transit", label: "In transit" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export const ROLES = [
  { id: "super_admin", label: "Super administrator" },
  { id: "management", label: "Management" },
  { id: "salesperson", label: "Salesperson" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
] as const;

export type FormState = { error?: string; success?: string } | null;

export type Spec = { label: string; value: string };

export type QuoteLine = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  weightKg: number;
};

export function quoteLinesFrom(quote: {
  items?: string | null;
  productId?: string | null;
  productName: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  productTotal: number;
}): QuoteLine[] {
  const parsed = parseJson<QuoteLine[]>(quote.items, []);
  if (parsed.length) return parsed;
  return [
    {
      productId: quote.productId || "",
      productName: quote.productName,
      sku: quote.sku || "",
      quantity: quote.quantity,
      unit: quote.unit,
      unitPrice: quote.unitPrice,
      lineTotal: quote.productTotal,
      weightKg: 0,
    },
  ];
}

export function labelOf(list: readonly { id: string; label: string }[], id: string) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function unitPrice(product: { price: number; promoPrice: number | null; stockStatus: string }) {
  if (product.stockStatus === "promotional" && product.promoPrice != null) return product.promoPrice;
  return product.price;
}

/** Statuses that may enter a priced quote basket. */
export const QUOTABLE_STATUSES = ["available", "promotional", "pre_order"] as const;

export function canQuoteStatus(stockStatus: string) {
  return (QUOTABLE_STATUSES as readonly string[]).includes(stockStatus);
}

export function availabilitySchema(stockStatus: string) {
  if (stockStatus === "out_of_stock" || stockStatus === "unavailable" || stockStatus === "discontinued") {
    return "https://schema.org/OutOfStock";
  }
  if (stockStatus === "pre_order" || stockStatus === "coming_soon") {
    return "https://schema.org/PreOrder";
  }
  return "https://schema.org/InStock";
}

export const CREDIT_STATUSES = [
  { id: "none", label: "None" },
  { id: "requested", label: "Requested" },
  { id: "approved", label: "Approved" },
  { id: "suspended", label: "Suspended" },
] as const;

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function num(formData: FormData, key: string) {
  const value = Number(String(formData.get(key) ?? "").replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
}
