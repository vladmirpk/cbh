"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cover } from "@/components/site/Cover";
import { ConfirmSheet, type ConfirmPayload } from "@/components/site/ConfirmSheet";

type Item = { slug: string; name: string; image?: string | null; qty: number };

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [confirm, setConfirm] = useState<(ConfirmPayload & { slug?: string }) | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("cbh_cart") || "[]");
      setItems(Array.isArray(raw) ? raw : []);
    } catch {
      setItems([]);
    }
  }, []);

  function askRemove(item: Item) {
    setConfirm({
      title: "Remove from cart?",
      message: "Confirm you want to take this product out of your cart.",
      detail: item.name,
      image: item.image || null,
      confirmLabel: "Yes, remove it",
      cancelLabel: "Keep it",
      tone: "danger",
      slug: item.slug,
    });
  }

  function remove() {
    if (!confirm?.slug) return;
    const next = items.filter((item) => item.slug !== confirm.slug);
    setItems(next);
    localStorage.setItem("cbh_cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cbh-cart"));
    setConfirm(null);
  }

  function askQuoteAll() {
    setConfirm({
      title: "Start a quote?",
      message: "Confirm you want to move these cart items into a provisional quote with delivery.",
      detail: `${items.length} product${items.length === 1 ? "" : "s"} in cart`,
      confirmLabel: "Yes, get a quote",
      cancelLabel: "Stay in cart",
    });
  }

  return (
    <div className="bg-plaster pb-24 md:pb-12">
      <div className="wrap py-12">
        <h1 className="display text-4xl text-ink">Cart</h1>
        {items.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-stone">
            Your cart is empty.{" "}
            <Link href="/products" className="font-bold text-ink">Explore products</Link>
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            {items.map((item) => (
              <div key={item.slug} className="grid grid-cols-[88px_1fr] items-center gap-4 rounded-2xl border border-line bg-white p-3 shadow-[0_10px_30px_rgba(12,60,140,0.05)] sm:grid-cols-[112px_1fr_auto]">
                <div className="aspect-square overflow-hidden rounded-xl bg-[#e8eef8]">
                  <Cover src={item.image} alt={item.name} />
                </div>
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`} className="font-extrabold text-ink hover:underline">{item.name}</Link>
                  <p className="mt-1 text-sm text-stone">Qty {item.qty}</p>
                </div>
                <div className="col-span-2 flex gap-3 text-sm font-bold sm:col-span-1 sm:justify-end">
                  <Link href={`/quote?product=${item.slug}`} className="text-ink">Quote</Link>
                  <button type="button" onClick={() => askRemove(item)} className="text-[#b42318]">Remove</button>
                </div>
              </div>
            ))}
            <div className="sticky bottom-20 z-10 mt-2 md:static md:bottom-auto">
              <button type="button" onClick={askQuoteAll} className="btn btn-primary w-full shadow-lg md:w-auto">
                Get a provisional quote
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmSheet
        open={Boolean(confirm)}
        payload={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.slug) remove();
          else if (confirm) window.location.href = "/quote";
        }}
      />
    </div>
  );
}
