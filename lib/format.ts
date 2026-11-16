import { round2 } from "./delivery";

export function money(value: number) {
  const rounded = round2(value);
  const hasCents = Math.abs(rounded - Math.trunc(rounded)) > 0.001;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
  return `US$${formatted}`;
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

export function waLink(phone: string, text: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
