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

type BasketLine = {
  productId: string;
  quantity: number;
};

function defaultQty(product: WizardProduct) {
  return Math.max(product.moq, product.unit === "brick" ? 1000 : product.moq);
}

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
  const initial = products.find((item) => item.slug === initialSlug) ?? null;
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initial?.id ?? products[0]?.id ?? "");
  const [draftQty, setDraftQty] = useState(initial ? String(defaultQty(initial)) : "1");
  const [basket, setBasket] = useState<BasketLine[]>(() =>
    initial ? [{ productId: initial.id, quantity: defaultQty(initial) }] : [],
  );
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [source, setSource] = useState(initialSource || "website");
  const [state, action, pending] = useActionState(createQuote, null);
  const selected = products.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (initialSource) return;
    const stored = localStorage.getItem("cbh_source");
    if (stored) setSource(stored);
  }, [initialSource]);

  const filtered = products.filter((item) => {
    const hay = `${item.name} ${item.sku} ${item.category}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  const lines = useMemo(() => {
    return basket
      .map((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product) return null;
        const price = unitPrice(product);
        const quantity = line.quantity;
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unit: product.unit,
          unitPrice: price,
          lineTotal: Math.round(price * quantity * 100) / 100,
          weightKg: Math.round(product.weightKg * quantity * 100) / 100,
          moq: product.moq,
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      lineTotal: number;
      weightKg: number;
      moq: number;
    }>;
  }, [basket, products]);

  const materialsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalWeight = lines.reduce((sum, line) => sum + line.weightKg, 0);
  const moqError = lines.find((line) => line.quantity < line.moq);

  const delivery = useMemo(() => {
    if (!location || !lines.length) return null;
    return calculateDelivery({
      weightKg: totalWeight,
      distanceKm: location.distanceKm,
      rates,
      vehicles,
    });
  }, [location, lines.length, totalWeight, rates, vehicles]);

  const draft = Number(draftQty);

  function addSelected() {
    if (!selected || !Number.isFinite(draft) || draft <= 0 || draft < selected.moq) return;
    setBasket((current) => {
      const existing = current.find((line) => line.productId === selected.id);
      if (existing) {
        return current.map((line) =>
          line.productId === selected.id ? { ...line, quantity: draft } : line,
        );
      }
      return [...current, { productId: selected.id, quantity: draft }];
    });
  }

  function updateQty(productId: string, value: string) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    setBasket((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    );
  }

  function removeLine(productId: string) {
    setBasket((current) => current.filter((line) => line.productId !== productId));
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="panel p-5 md:p-7">
        <ol className="mb-6 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-stone">
          {["Products", "Location", "Your details"].map((label, index) => (
            <li key={label} className={step === index + 1 ? "text-brick" : ""}>{index + 1}. {label}</li>
          ))}
        </ol>

        {step === 1 ? (
          <div className="grid gap-4">
            <p className="text-sm text-stone">Add every product for this site — bricks, cement, pavers, solar — then continue once the basket looks right.</p>
            <label>
              <span className="label">Search products</span>
              <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bricks, pavers, solar…" />
            </label>
            <div className="grid max-h-64 gap-2 overflow-auto">
              {filtered.map((item) => {
                const inBasket = basket.some((line) => line.productId === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      const existing = basket.find((line) => line.productId === item.id);
                      setDraftQty(String(existing?.quantity ?? defaultQty(item)));
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left ${item.id === selectedId ? "border-brick bg-white" : "border-line"}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="block font-semibold text-ink">{item.name}</span>
                      {inBasket ? <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#157347]">In quote</span> : null}
                    </span>
                    <span className="text-sm text-stone">{item.category} · {money(unitPrice(item))} / {item.unit} · min {item.moq}</span>
                  </button>
                );
              })}
            </div>
            {selected ? (
              <div className="grid gap-3 rounded-2xl border border-line bg-plaster p-4 sm:grid-cols-[1fr_auto]">
                <label>
                  <span className="label">Quantity ({selected.unit})</span>
                  <input
                    className="field"
                    inputMode="decimal"
                    value={draftQty}
                    onChange={(event) => setDraftQty(event.target.value)}
                  />
                  {Number.isFinite(draft) && draft < selected.moq ? (
                    <p className="mt-1 text-sm text-brick">Minimum order is {selected.moq} {selected.unit}.</p>
                  ) : null}
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="btn btn-primary w-full sm:w-auto"
                    disabled={!Number.isFinite(draft) || draft < selected.moq}
                    onClick={addSelected}
                  >
                    {basket.some((line) => line.productId === selected.id) ? "Update in quote" : "Add to quote"}
                  </button>
                </div>
              </div>
            ) : null}

            {lines.length ? (
              <div className="grid gap-2">
                <p className="label">Your quote basket</p>
                {lines.map((line) => (
                  <div key={line.productId} className="grid gap-2 rounded-2xl border border-line bg-white p-3 sm:grid-cols-[1fr_120px_auto] sm:items-center">
                    <div>
                      <p className="font-semibold text-ink">{line.productName}</p>
                      <p className="text-sm text-stone">{line.sku} · {money(line.unitPrice)} / {line.unit}</p>
                    </div>
                    <input
                      className="field"
                      inputMode="decimal"
                      value={String(line.quantity)}
                      onChange={(event) => updateQty(line.productId, event.target.value)}
                      aria-label={`Quantity for ${line.productName}`}
                    />
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="text-sm font-semibold">{money(line.lineTotal)}</span>
                      <button type="button" className="text-sm font-semibold text-brick" onClick={() => removeLine(line.productId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone">No products in the quote yet. Pick one above and add it.</p>
            )}

            {moqError ? (
              <p className="text-sm text-brick">
                {moqError.productName} needs at least {moqError.moq} {moqError.unit}.
              </p>
            ) : null}

            <button
              className="btn btn-ink"
              type="button"
              disabled={!lines.length || Boolean(moqError)}
              onClick={() => setStep(2)}
            >
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

        {step === 3 && location && lines.length ? (
          <form action={action} className="grid gap-4">
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(
                lines.map((line) => ({
                  productId: line.productId,
                  productName: line.productName,
                  sku: line.sku,
                  quantity: line.quantity,
                  unit: line.unit,
                  unitPrice: line.unitPrice,
                  lineTotal: line.lineTotal,
                  weightKg: line.weightKg,
                })),
              )}
            />
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
        <h2 className="display mt-2 text-3xl leading-none">
          {lines.length ? `${lines.length} product${lines.length === 1 ? "" : "s"}` : "Empty quote"}
        </h2>
        {lines.length ? (
          <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
            {lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3 border-b border-line pb-2">
                <span>
                  <span className="font-semibold text-ink">{line.productName}</span>
                  <span className="block text-stone">{formatQty(line.quantity)} {line.unit}</span>
                </span>
                <span className="shrink-0 font-semibold">{money(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-stone">Add products to build a multi-item provisional quote.</p>
        )}
        <dl className="mt-5 grid gap-2 text-sm">
          <div className="flex justify-between"><dt>Materials</dt><dd>{money(materialsTotal)}</dd></div>
          <div className="flex justify-between"><dt>Estimated delivery</dt><dd>{delivery ? money(delivery.deliveryCost) : "—"}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <dt>Provisional total</dt>
            <dd>{delivery ? money(materialsTotal + delivery.deliveryCost) : "—"}</dd>
          </div>
        </dl>
        {delivery ? (
          <p className="mt-3 text-xs text-stone">{delivery.vehicle} · {delivery.trips} trip{delivery.trips === 1 ? "" : "s"} · {delivery.distanceKm} km · {formatQty(delivery.weightKg)} kg</p>
        ) : (
          <p className="mt-3 text-xs text-stone">Choose a location to price delivery for the full load.</p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-copper">This is a provisional quotation. Final delivery charges are confirmed by CBH.</p>
      </aside>
    </div>
  );
}
