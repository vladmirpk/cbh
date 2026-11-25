"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatQty, money } from "@/lib/format";

type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  unit: string;
  price: number;
  moq: number;
  weightKg: number;
  stockStatus: string;
  kind: "inverter" | "battery" | "panel" | "other";
  capacity: number;
};

export function SolarConfigurator({ catalog }: { catalog: CatalogItem[] }) {
  const [kwhMonth, setKwhMonth] = useState("350");
  const [backupHours, setBackupHours] = useState("4");
  const [property, setProperty] = useState("home");

  const plan = useMemo(() => {
    const monthly = Math.max(50, Number(kwhMonth) || 350);
    const hours = Math.max(1, Number(backupHours) || 4);
    const dailyKwh = monthly / 30;
    const inverterKva = Math.max(3, Math.ceil(dailyKwh / 4));
    const batteryKwh = Math.max(2.5, Math.round(dailyKwh * (hours / 8) * 10) / 10);
    const panelKw = Math.max(1.5, Math.round(dailyKwh * 1.3 * 10) / 10);

    const inverter = pick(catalog, "inverter", inverterKva);
    const battery = pick(catalog, "battery", batteryKwh);
    const panel = pick(catalog, "panel", panelKw);

    const lines = [
      inverter && {
        ...inverter,
        qty: Math.max(inverter.moq, 1),
        reason: `~${inverterKva} kVA class for ${property}`,
      },
      battery && {
        ...battery,
        qty: Math.max(battery.moq, Math.ceil(batteryKwh / Math.max(battery.capacity || batteryKwh, 0.1))),
        reason: `~${batteryKwh} kWh backup (~${hours} h)`,
      },
      panel && {
        ...panel,
        qty: Math.max(
          panel.moq,
          Math.ceil((panelKw * 1000) / Math.max((panel.capacity || 0.55) * 1000, 100)),
        ),
        reason: `~${panelKw} kW array`,
      },
    ].filter(Boolean) as Array<CatalogItem & { qty: number; reason: string }>;

    const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    return { lines, total, inverterKva, batteryKwh, panelKw };
  }, [catalog, kwhMonth, backupHours, property]);

  const quoteHref =
    plan.lines.length === 1
      ? `/quote?product=${plan.lines[0].slug}&src=website`
      : `/quote?from=cart&src=website`;

  function stashCart() {
    if (plan.lines.length <= 1) return;
    const payload = plan.lines.map((line) => ({
      slug: line.slug,
      name: line.name,
      qty: line.qty,
    }));
    localStorage.setItem("cbh_cart", JSON.stringify(payload));
    window.dispatchEvent(new Event("cbh-cart"));
    window.location.href = "/quote?from=cart";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="panel grid gap-4 p-5">
        <label>
          <span className="label">Property</span>
          <select className="field" value={property} onChange={(e) => setProperty(e.target.value)}>
            <option value="home">Home</option>
            <option value="farm">Farm</option>
            <option value="business">Business</option>
          </select>
        </label>
        <label>
          <span className="label">Average monthly use (kWh)</span>
          <input className="field" inputMode="decimal" value={kwhMonth} onChange={(e) => setKwhMonth(e.target.value)} />
        </label>
        <label>
          <span className="label">Desired backup (hours)</span>
          <input className="field" inputMode="decimal" value={backupHours} onChange={(e) => setBackupHours(e.target.value)} />
        </label>
      </div>
      <div className="panel p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-stone">Recommended kit</p>
        <h2 className="display mt-2 text-3xl">
          {plan.lines.length ? money(plan.total) : "No match"}
        </h2>
        <ul className="mt-4 grid gap-3">
          {plan.lines.map((line) => (
            <li key={line.id} className="rounded-2xl border border-line p-3 text-sm">
              <p className="font-semibold text-ink">{line.name}</p>
              <p className="text-stone">{formatQty(line.qty)} {line.unit} · {money(line.price * line.qty)}</p>
              <p className="mt-1 text-xs text-stone">{line.reason}</p>
              <Link href={`/products/${line.slug}`} className="mt-2 inline-block text-xs font-bold text-ink">View product</Link>
            </li>
          ))}
          {!plan.lines.length ? <li className="text-sm text-stone">Add solar products to the catalogue to power recommendations.</li> : null}
        </ul>
        {plan.lines.length === 1 ? (
          <Link href={quoteHref} className="btn btn-primary mt-5">Request detailed quote</Link>
        ) : plan.lines.length > 1 ? (
          <button type="button" className="btn btn-primary mt-5" onClick={stashCart}>Request detailed quote</button>
        ) : null}
      </div>
    </div>
  );
}

function pick(catalog: CatalogItem[], kind: CatalogItem["kind"], target: number) {
  const pool = catalog.filter((item) => item.kind === kind && ["available", "promotional", "pre_order"].includes(item.stockStatus));
  if (!pool.length) return null;
  const scored = pool
    .map((item) => ({ item, score: Math.abs((item.capacity || target) - target) }))
    .sort((a, b) => a.score - b.score);
  return scored[0]?.item ?? null;
}
