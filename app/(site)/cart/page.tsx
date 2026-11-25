"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Cover } from "@/components/site/Cover";
import { ConfirmSheet, type ConfirmPayload } from "@/components/site/ConfirmSheet";

type Item = { slug: string; name: string; image?: string | null; qty: number };

function persist(next: Item[]) {
  localStorage.setItem("cbh_cart", JSON.stringify(next));
  window.dispatchEvent(new Event("cbh-cart"));
}

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [confirm, setConfirm] = useState<(ConfirmPayload & { slug?: string; goQuote?: boolean; clearAll?: boolean }) | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("cbh_cart") || "[]");
      setItems(Array.isArray(raw) ? raw : []);
    } catch {
      setItems([]);
    }
  }, []);

  function setQty(slug: string, qty: number) {
    const next = items
      .map((item) => (item.slug === slug ? { ...item, qty: Math.max(1, qty) } : item))
      .filter((item) => item.qty > 0);
    setItems(next);
    persist(next);
  }

  function askRemove(item: Item) {
    setConfirm({
      title: "Remove from cart?",
      message: item.name,
      confirmLabel: "Remove",
      cancelLabel: "Keep",
      tone: "danger",
      slug: item.slug,
    });
  }

  function remove() {
    if (!confirm?.slug) return;
    const next = items.filter((item) => item.slug !== confirm.slug);
    setItems(next);
    persist(next);
    setConfirm(null);
  }

  function askClear() {
    setConfirm({
      title: "Clear cart?",
      message: `${items.length} item${items.length === 1 ? "" : "s"} will be removed`,
      confirmLabel: "Clear cart",
      cancelLabel: "Keep",
      tone: "danger",
      clearAll: true,
    });
  }

  const totalUnits = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="bg-plaster pb-28 md:pb-12">
      <div className="wrap py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Basket</p>
            <h1 className="display mt-1 text-4xl text-ink sm:text-5xl">Your cart</h1>
            <p className="mt-2 text-sm text-stone">
              {items.length
                ? `${items.length} line${items.length === 1 ? "" : "s"} · ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`
                : "Save products here, then quote delivery in one step."}
            </p>
          </div>
          {items.length ? (
            <button type="button" onClick={askClear} className="text-sm font-bold text-[#b42318]">
              Clear cart
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[1.6rem] border border-dashed border-line bg-white px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-plaster text-ink">
              <ShoppingBag size={26} />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-ink">Cart is empty</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone">
              Browse the yard, add lines you want priced, then open a provisional quote with delivery.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/products" className="btn btn-primary">Browse products</Link>
              <Link href="/quote" className="btn btn-ghost border border-line">Start a quote</Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <ul className="grid gap-3">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="grid grid-cols-[88px_1fr] gap-4 rounded-2xl border border-line bg-white p-3 shadow-[0_8px_24px_rgba(12,60,140,0.05)] sm:grid-cols-[112px_1fr_auto] sm:items-center"
                >
                  <Link href={`/products/${item.slug}`} className="aspect-square overflow-hidden rounded-xl bg-[#e8eef8]">
                    <Cover src={item.image} alt={item.name} />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/products/${item.slug}`} className="font-extrabold text-ink hover:underline">
                      {item.name}
                    </Link>
                    <div className="mt-3 inline-flex items-center rounded-xl border border-line bg-plaster">
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center text-ink"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.slug, item.qty - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        className="h-9 w-14 border-x border-line bg-white text-center text-sm font-bold outline-none"
                        value={String(item.qty)}
                        inputMode="numeric"
                        onChange={(event) => setQty(item.slug, Number(event.target.value) || 1)}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center text-ink"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.slug, item.qty + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                    <Link href={`/quote?product=${item.slug}`} className="text-sm font-bold text-ink">
                      Quote this →
                    </Link>
                    <button
                      type="button"
                      onClick={() => askRemove(item)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#b42318]"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(12,60,140,0.05)] lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Next step</p>
              <h2 className="display mt-2 text-3xl text-ink">Ready to quote?</h2>
              <p className="mt-2 text-sm text-stone">
                We’ll take these lines into the quotation wizard, add delivery to your suburb, and give you a provisional total.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li className="flex justify-between border-b border-line pb-2">
                  <span className="text-stone">Lines</span>
                  <span className="font-bold">{items.length}</span>
                </li>
                <li className="flex justify-between border-b border-line pb-2">
                  <span className="text-stone">Units</span>
                  <span className="font-bold">{totalUnits}</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() =>
                  setConfirm({
                    title: "Open quote?",
                    message: `${items.length} item${items.length === 1 ? "" : "s"} from cart`,
                    confirmLabel: "Go to quote",
                    cancelLabel: "Back",
                    goQuote: true,
                  })
                }
                className="btn btn-primary mt-5 w-full"
              >
                Get a quote
              </button>
              <Link href="/products" className="btn btn-ghost mt-2 w-full border border-line">
                Keep browsing
              </Link>
            </aside>
          </div>
        )}
      </div>

      <ConfirmSheet
        open={Boolean(confirm)}
        payload={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.slug) remove();
          else if (confirm?.clearAll) {
            setItems([]);
            persist([]);
            setConfirm(null);
          } else if (confirm?.goQuote) window.location.href = "/quote?from=cart";
        }}
      />
    </div>
  );
}
