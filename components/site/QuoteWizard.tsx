"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { createQuote } from "@/lib/actions/public";
import { calculateDelivery, type RateCard, type VehicleRate } from "@/lib/delivery";
import { formatQty, money } from "@/lib/format";
import { unitPrice } from "@/lib/types";
import { ZonePicker, type LocationChoice, type ZoneOption } from "./ZonePicker";

type WizardProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  unit: string;
  price: number;
  promoPrice: number | null;
  moq: number;
  weightKg: number;
  stockStatus: string;
  category: string;
};

export function QuoteWizard({
  products,
  zones,
  vehicles,
  rates,
  depot,
  mapsKey,
  initialSlug,
  initialSource,
}: {
  products: WizardProduct[];
  zones: ZoneOption[];
  vehicles: VehicleRate[];
  rates: RateCard;
  depot: { name: string; lat: number; lng: number };
  mapsKey?: string;
  initialSlug?: string;
  initialSource?: string;
}) {
  const initial = products.find((item) => item.slug === initialSlug) ?? products[0];
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState(initial?.id ?? "");
  const [quantity, setQuantity] = useState(initial ? String(Math.max(initial.moq, initial.unit === "brick" ? 1000 : initial.moq)) : "1");
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [source, setSource] = useState(initialSource || "website");
  const [state, action, pending] = useActionState(createQuote, null);
  const product = products.find((item) => item.id === productId) ?? null;

  useEffect(() => {
    if (initialSource) return;
    const stored = localStorage.getItem("cbh_source");
    if (stored) setSource(stored);
  }, [initialSource]);

  const filtered = products.filter((item) => {
    const hay = `${item.name} ${item.sku} ${item.category}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  const qty = Number(quantity);
  const price = product ? unitPrice(product) : 0;
  const productTotal = product && Number.isFinite(qty) ? Math.round(price * qty * 100) / 100 : 0;
  const delivery = useMemo(() => {
    if (!product || !location || !Number.isFinite(qty) || qty <= 0) return null;
    return calculateDelivery({
      quantity: qty,
      weightKgEach: product.weightKg,
      distanceKm: location.distanceKm,
      rates,
      vehicles,
    });
  }, [product, location, qty, rates, vehicles]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="panel p-5 md:p-7">
        <ol className="mb-6 flex gap-4 text-xs uppercase tracking-[0.14em] text-stone">
          {["Product", "Location", "Your details"].map((label, index) => (
            <li key={label} className={step === index + 1 ? "text-brick" : ""}>{index + 1}. {label}</li>
          ))}
        </ol>
        {step === 1 && product ? (
          <div className="grid gap-4">
            <label>
              <span className="label">Search products</span>
              <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bricks, pavers, solar…" />
            </label>
            <div className="grid max-h-80 gap-2 overflow-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setProductId(item.id);
                    setQuantity(String(Math.max(item.moq, item.unit === "brick" ? 1000 : item.moq)));
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left ${item.id === productId ? "border-brick bg-white" : "border-line"}`}
                >
                  <span className="block font-semibold">{item.name}</span>
                  <span className="text-sm text-stone">{item.category} · {money(unitPrice(item))} / {item.unit} · min {item.moq}</span>
                </button>
              ))}
            </div>
            <label>
              <span className="label">Quantity ({product.unit})</span>
              <input className="field" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </label>
            {qty < product.moq ? <p className="text-sm text-brick">Minimum order is {product.moq} {product.unit}.</p> : null}
            <button className="btn btn-ink" type="button" disabled={!product || qty < product.moq} onClick={() => setStep(2)}>
              Continue to location
            </button>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="grid gap-4">
            <ZonePicker zones={zones} depot={depot} roadFactor={rates.roadFactor} mapsKey={mapsKey} value={location} onChange={setLocation} />
            <div className="flex gap-2">
              <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-ink" type="button" disabled={!location} onClick={() => setStep(3)}>Add your details</button>
            </div>
          </div>
        ) : null}
        {step === 3 && product && location ? (
          <form action={action} className="grid gap-4">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value={quantity} />
            <input type="hidden" name="zoneId" value={location.zoneId} />
            <input type="hidden" name="method" value={location.method} />
            <input type="hidden" name="lat" value={location.lat} />
            <input type="hidden" name="lng" value={location.lng} />
            <input type="hidden" name="source" value={source} />
            <label><span className="label">Name</span><input className="field" name="name" required /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="label">Phone</span><input className="field" name="phone" required /></label>
              <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" placeholder="Same as phone if blank" /></label>
            </div>
            <label><span className="label">Email</span><input className="field" name="email" type="email" /></label>
            <label><span className="label">Street address, stand or site name</span><input className="field" name="address" placeholder="Added to the suburb you selected" /></label>
            <label><span className="label">Date required</span><input className="field" name="requiredDate" type="date" /></label>
            <label><span className="label">Notes</span><textarea className="field min-h-24" name="requirements" /></label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="customerType" value="contractor" /> This is a contractor or business account
            </label>
            <label><span className="label">Company</span><input className="field" name="company" /></label>
            {state?.error ? <p className="text-sm text-brick">{state.error}</p> : null}
            <div className="flex gap-2">
              <button className="btn btn-ghost" type="button" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" disabled={pending}>{pending ? "Preparing quote…" : "Create provisional quote"}</button>
            </div>
          </form>
        ) : null}
      </div>
      <aside className="panel sticky top-24 p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-stone">Live estimate</p>
        {product ? (
          <>
            <h2 className="display mt-2 text-3xl leading-none">{product.name}</h2>
            <p className="mt-2 text-sm text-stone">{product.sku} · {formatQty(Number.isFinite(qty) ? qty : 0)} {product.unit}</p>
            <dl className="mt-5 grid gap-2 text-sm">
              <div className="flex justify-between"><dt>Materials</dt><dd>{money(productTotal)}</dd></div>
              <div className="flex justify-between"><dt>Estimated delivery</dt><dd>{delivery ? money(delivery.deliveryCost) : "—"}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Provisional total</dt>
                <dd>{delivery ? money(productTotal + delivery.deliveryCost) : "—"}</dd>
              </div>
            </dl>
            {delivery ? <p className="mt-3 text-xs text-stone">{delivery.vehicle} · {delivery.trips} trip{delivery.trips === 1 ? "" : "s"} · {delivery.distanceKm} km</p> : <p className="mt-3 text-xs text-stone">Choose a location to price delivery.</p>}
            <p className="mt-4 text-xs leading-relaxed text-copper">This is a provisional quotation. Final delivery charges are confirmed by CBH.</p>
          </>
        ) : <p>Add a product to the catalogue to start quoting.</p>}
      </aside>
    </div>
  );
}
