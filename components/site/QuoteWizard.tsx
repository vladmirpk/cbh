"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useActionState } from "react";
import { Check, Minus, Plus, Search, Trash2 } from "lucide-react";
import { createQuote } from "@/lib/actions/public";
import { calculateDelivery, type RateCard, type VehicleRate } from "@/lib/delivery";
import { formatQty, money } from "@/lib/format";
import { canQuoteStatus, unitPrice } from "@/lib/types";
import { ConfirmSheet, type ConfirmPayload } from "./ConfirmSheet";
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
  image?: string | null;
};

type BasketLine = {
  productId: string;
  quantity: number;
};

type CartItem = { slug: string; name: string; image?: string | null; qty: number };

function defaultQty(product: WizardProduct) {
  return Math.max(product.moq, product.unit === "brick" ? 1000 : product.moq);
}

function basketFromCart(products: WizardProduct[]): BasketLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem("cbh_cart") || "[]") as CartItem[];
    if (!Array.isArray(raw) || !raw.length) return [];
    const lines: BasketLine[] = [];
    for (const item of raw) {
      const product = products.find((entry) => entry.slug === item.slug);
      if (!product) continue;
      const qty = Number(item.qty);
      lines.push({
        productId: product.id,
        quantity: Math.max(product.moq, Number.isFinite(qty) && qty > 0 ? qty : defaultQty(product)),
      });
    }
    return lines;
  } catch {
    return [];
  }
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
  fromCart = false,
}: {
  products: WizardProduct[];
  zones: ZoneOption[];
  vehicles: VehicleRate[];
  rates: RateCard;
  depot: { name: string; lat: number; lng: number };
  mapsKey?: string;
  initialSlug?: string;
  initialSource?: string;
  fromCart?: boolean;
}) {
  const initial = products.find((item) => item.slug === initialSlug) ?? null;
  const categories = useMemo(
    () => [...new Set(products.map((item) => item.category))].sort(),
    [products],
  );
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [basket, setBasket] = useState<BasketLine[]>(() =>
    initial ? [{ productId: initial.id, quantity: defaultQty(initial) }] : [],
  );
  const [flashId, setFlashId] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [source, setSource] = useState(initialSource || "website");
  const [confirm, setConfirm] = useState<(ConfirmPayload & { kind: "remove" | "submit"; productId?: string }) | null>(null);
  const skipConfirm = useRef(false);
  const cartLoaded = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(createQuote, null);

  useEffect(() => {
    if (initialSource) return;
    const stored = localStorage.getItem("cbh_source");
    if (stored) setSource(stored);
  }, [initialSource]);

  useEffect(() => {
    if (cartLoaded.current) return;
    if (initial && !fromCart) return;
    const fromStorage = basketFromCart(products);
    if (!fromStorage.length) return;
    cartLoaded.current = true;
    setBasket(fromStorage);
  }, [products, initial, fromCart]);

  useEffect(() => {
    if (!flashId) return;
    const timer = window.setTimeout(() => setFlashId(null), 1200);
    return () => window.clearTimeout(timer);
  }, [flashId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      if (!canQuoteStatus(item.stockStatus)) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(q);
    });
  }, [products, query, category]);

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

  function addProduct(product: WizardProduct) {
    setBasket((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) return current;
      return [...current, { productId: product.id, quantity: defaultQty(product) }];
    });
    setFlashId(product.id);
  }

  function bumpQty(productId: string, delta: number) {
    setBasket((current) =>
      current.map((line) => {
        if (line.productId !== productId) return line;
        const product = products.find((item) => item.id === productId);
        const moq = product?.moq ?? 1;
        const next = Math.max(moq, line.quantity + delta);
        return { ...line, quantity: next };
      }),
    );
  }

  function setQty(productId: string, value: string) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    setBasket((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    );
  }

  function askRemoveLine(productId: string) {
    const line = lines.find((item) => item.productId === productId);
    if (!line) return;
    setConfirm({
      kind: "remove",
      productId,
      title: "Remove from quote?",
      message: line.productName,
      confirmLabel: "Remove",
      cancelLabel: "Keep",
      tone: "danger",
    });
  }

  function applyRemoveLine() {
    if (!confirm?.productId) return;
    setBasket((current) => current.filter((line) => line.productId !== confirm.productId));
    setConfirm(null);
  }

  const steps = [
    { id: 1, label: "Products" },
    { id: 2, label: "Location" },
    { id: 3, label: "Details" },
  ] as const;

  return (
    <div className="grid items-start gap-5 pb-28 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-0">
      <div className="overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-[0_12px_40px_rgba(12,60,140,0.06)]">
        <div className="grid grid-cols-3 border-b border-line bg-plaster">
          {steps.map((item) => {
            const done = step > item.id;
            const active = step === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.id > 1 && !lines.length}
                onClick={() => {
                  if (item.id === 1) setStep(1);
                  else if (item.id === 2 && lines.length && !moqError) setStep(2);
                  else if (item.id === 3 && lines.length && location && !moqError) setStep(3);
                }}
                className={`relative px-3 py-3.5 text-left transition ${
                  active ? "bg-white text-ink" : done ? "text-ink" : "text-stone"
                } ${item.id > 1 ? "border-l border-line" : ""}`}
              >
                <span className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${
                  active ? "bg-gold text-[#10233f]" : done ? "bg-ink text-white" : "bg-white text-stone"
                }`}>
                  {done && !active ? <Check size={12} /> : item.id}
                </span>
                <span className="block text-sm font-extrabold">{item.label}</span>
                {active ? <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold" /> : null}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {step === 1 ? (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-ink">Add products</h2>
                <p className="mt-1 text-sm text-stone">Search or filter, then tap Add. Edit quantities in your quote.</p>
                <div className="relative mt-4">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
                  <input
                    ref={searchRef}
                    className="field pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products to add…"
                    aria-label="Search products"
                  />
                </div>

                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                  <Chip active={category === "all"} onClick={() => setCategory("all")}>
                    All
                  </Chip>
                  {categories.map((name) => (
                    <Chip key={name} active={category === name} onClick={() => setCategory(name)}>
                      {name}
                    </Chip>
                  ))}
                </div>

                <ul className="mt-3 max-h-[min(48vh,400px)] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-plaster/40">
                  {filtered.length ? (
                    filtered.map((item) => {
                      const inBasket = basket.some((line) => line.productId === item.id);
                      const justAdded = flashId === item.id;
                      return (
                        <li key={item.id} className="flex items-center gap-3 bg-white/80 px-3 py-3 backdrop-blur-sm">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold text-ink">{item.name}</p>
                            <p className="truncate text-xs text-stone">
                              {money(unitPrice(item))} / {item.unit}
                              <span className="text-stone/70"> · min {item.moq}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addProduct(item)}
                            disabled={inBasket}
                            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                              inBasket
                                ? "bg-[#e7f6ee] text-[#157347]"
                                : "bg-ink text-white hover:bg-[#0a3278]"
                            }`}
                          >
                            {inBasket ? (
                              <span className="inline-flex items-center gap-1">
                                <Check size={13} />
                                {justAdded ? "Added" : "In quote"}
                              </span>
                            ) : (
                              "Add"
                            )}
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <li className="bg-white px-3 py-8 text-center text-sm text-stone">No products match that search.</li>
                  )}
                </ul>
              </div>

              <div className="min-w-0 rounded-2xl border border-line bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-ink">Your quote</h2>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-stone shadow-sm">
                    {lines.length ? `${lines.length} item${lines.length === 1 ? "" : "s"}` : "Empty"}
                  </span>
                </div>

                {lines.length ? (
                  <ul className="mt-3 space-y-2">
                    {lines.map((line) => (
                      <li key={line.productId} className="rounded-xl border border-line bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-ink">{line.productName}</p>
                            <p className="text-xs text-stone">{money(line.unitPrice)} / {line.unit}</p>
                          </div>
                          <button
                            type="button"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone hover:bg-plaster hover:text-[#b42318]"
                            aria-label={`Remove ${line.productName}`}
                            onClick={() => askRemoveLine(line.productId)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-xl border border-line bg-plaster">
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center text-ink"
                              aria-label="Decrease quantity"
                              onClick={() => bumpQty(line.productId, -Math.max(1, Math.round(line.moq / 10) || 1))}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              className="h-9 w-16 border-x border-line bg-white text-center text-sm font-bold outline-none"
                              inputMode="decimal"
                              value={String(line.quantity)}
                              onChange={(event) => setQty(line.productId, event.target.value)}
                              aria-label={`Quantity for ${line.productName}`}
                            />
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center text-ink"
                              aria-label="Increase quantity"
                              onClick={() => bumpQty(line.productId, Math.max(1, Math.round(line.moq / 10) || 1))}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-extrabold text-ink">{money(line.lineTotal)}</p>
                        </div>
                        {line.quantity < line.moq ? (
                          <p className="mt-1 text-xs font-semibold text-[#b42318]">
                            Minimum {line.moq} {line.unit}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-stone">
                    Tap <span className="font-bold text-ink">Add</span> beside a product. Quantities edit here.
                  </p>
                )}

                {moqError ? (
                  <p className="mt-3 text-sm font-semibold text-[#b42318]">
                    Raise quantity for {moqError.productName} (min {moqError.moq}).
                  </p>
                ) : null}

                <button
                  className="btn btn-ink mt-4 hidden w-full lg:inline-flex"
                  type="button"
                  disabled={!lines.length || Boolean(moqError)}
                  onClick={() => setStep(2)}
                >
                  Continue to location
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4">
              <p className="text-sm text-stone">Where should we deliver? Delivery estimate updates beside.</p>
              <ZonePicker zones={zones} depot={depot} roadFactor={rates.roadFactor} mapsKey={mapsKey} value={location} onChange={setLocation} />
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>Back to products</button>
                <button className="btn btn-ink" type="button" disabled={!location} onClick={() => setStep(3)}>
                  Continue to details
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 && location && lines.length ? (
            <form
              id="cbh-quote-form"
              action={action}
              className="grid max-w-xl gap-3"
              onSubmit={(event) => {
                if (skipConfirm.current) {
                  skipConfirm.current = false;
                  return;
                }
                event.preventDefault();
                setConfirm({
                  kind: "submit",
                  title: "Create quote?",
                  message: `${lines.length} item${lines.length === 1 ? "" : "s"} · ${money(materialsTotal + (delivery?.deliveryCost || 0))}`,
                  confirmLabel: "Create quote",
                  cancelLabel: "Back",
                });
              }}
            >
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
              <label><span className="label">Name</span><input className="field" name="name" required autoComplete="name" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label><span className="label">Phone</span><input className="field" name="phone" required autoComplete="tel" /></label>
                <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" placeholder="Same as phone if blank" /></label>
              </div>
              <label><span className="label">Email</span><input className="field" name="email" type="email" autoComplete="email" /></label>
              <label><span className="label">Site / stand</span><input className="field" name="address" /></label>
              <label><span className="label">Date required</span><input className="field" name="requiredDate" type="date" /></label>
              <label><span className="label">Notes</span><textarea className="field min-h-20" name="requirements" /></label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="customerType" value="contractor" /> Contractor / business
              </label>
              <label><span className="label">Company</span><input className="field" name="company" /></label>
              {state?.error ? <p className="text-sm font-semibold text-[#b42318]">{state.error}</p> : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" disabled={pending}>{pending ? "Creating…" : "Create quote"}</button>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      <aside className="sticky top-20 hidden overflow-hidden rounded-[1.4rem] border border-line bg-ink text-white shadow-[0_12px_40px_rgba(12,60,140,0.12)] lg:block">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Estimate</p>
          <h2 className="display mt-1 text-3xl leading-none">
            {delivery ? money(materialsTotal + delivery.deliveryCost) : money(materialsTotal)}
          </h2>
          <p className="mt-1 text-xs text-white/65">
            {lines.length ? `${lines.length} line${lines.length === 1 ? "" : "s"} · provisional` : "Add products to start"}
          </p>
        </div>
        <div className="px-5 py-4">
          {lines.length ? (
            <ul className="max-h-44 space-y-2 overflow-auto text-sm">
              {lines.map((line) => (
                <li key={line.productId} className="flex justify-between gap-3 border-b border-white/10 pb-2">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{line.productName}</span>
                    <span className="text-white/60">{formatQty(line.quantity)} {line.unit}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{money(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/65">Your running total appears here.</p>
          )}
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between text-white/80"><dt>Materials</dt><dd>{money(materialsTotal)}</dd></div>
            <div className="flex justify-between text-white/80"><dt>Delivery</dt><dd>{delivery ? money(delivery.deliveryCost) : "—"}</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-gold">{delivery ? money(materialsTotal + delivery.deliveryCost) : money(materialsTotal)}</dd>
            </div>
          </dl>
          {delivery ? (
            <p className="mt-3 text-xs text-white/60">{delivery.vehicle} · {delivery.trips} trip{delivery.trips === 1 ? "" : "s"} · {delivery.distanceKm} km</p>
          ) : (
            <p className="mt-3 text-xs text-white/60">Delivery after you pick a location.</p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-white/50">Provisional. CBH confirms the formal quotation.</p>
        </div>
      </aside>

      {/* Mobile sticky continue — keeps thumbs off the catalogue scroll */}
      {step === 1 ? (
        <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-extrabold text-ink">{money(materialsTotal)}</p>
              <p className="truncate text-xs text-stone">
                {lines.length ? `${lines.length} item${lines.length === 1 ? "" : "s"} in quote` : "Add at least one product"}
              </p>
            </div>
            <button
              className="btn btn-ink h-11 shrink-0 px-4"
              type="button"
              disabled={!lines.length || Boolean(moqError)}
              onClick={() => setStep(2)}
            >
              Location
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmSheet
        open={Boolean(confirm)}
        payload={confirm}
        busy={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "remove") applyRemoveLine();
          else if (confirm.kind === "submit") {
            const form = document.getElementById("cbh-quote-form") as HTMLFormElement | null;
            setConfirm(null);
            skipConfirm.current = true;
            form?.requestSubmit();
          }
        }}
      />
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
        active ? "bg-ink text-white" : "border border-line bg-white text-stone hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
