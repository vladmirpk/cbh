"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { slug: string; name: string; qty: number };

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
    <div className="bg-[#f6f8fc]">
      <div className="wrap py-12">
        <h1 className="text-4xl font-extrabold text-[#0c3c8c]">Cart</h1>
        {items.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-white p-6">Your cart is empty. <Link href="/products" className="font-bold text-[#0c3c8c]">Explore products</Link></p>
        ) : (
          <div className="mt-6 grid gap-3">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between rounded-2xl bg-white p-4">
                <div>
                  <p className="font-bold text-[#0c3c8c]">{item.name}</p>
                  <p className="text-sm text-[#3d5a80]">Qty {item.qty}</p>
                </div>
                <div className="flex gap-3 text-sm font-bold">
                  <Link href={`/quote?product=${item.slug}`} className="text-[#0c3c8c]">Quote</Link>
                  <button onClick={() => remove(item.slug)} className="text-[#c2410c]">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
