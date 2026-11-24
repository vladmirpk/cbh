"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cover } from "@/components/site/Cover";

type Item = { slug: string; name: string; image?: string | null; qty: number };

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("cbh_cart") || "[]");
      setItems(Array.isArray(raw) ? raw : []);
    } catch {
      setItems([]);
    }
  }, []);

  function remove(slug: string) {
    const next = items.filter((item) => item.slug !== slug);
    setItems(next);
    localStorage.setItem("cbh_cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cbh-cart"));
  }

  return (
    <div className="bg-plaster">
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
                  <button type="button" onClick={() => remove(item.slug)} className="text-[#b42318]">Remove</button>
                </div>
              </div>
            ))}
            <div className="mt-2">
              <Link href="/quote" className="btn btn-primary">Get a provisional quote</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
