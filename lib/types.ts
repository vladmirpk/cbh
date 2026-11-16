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

export function labelOf(list: readonly { id: string; label: string }[], id: string) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function unitPrice(product: { price: number; promoPrice: number | null; stockStatus: string }) {
  if (product.stockStatus === "promotional" && product.promoPrice != null) return product.promoPrice;
  return product.price;
}

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
