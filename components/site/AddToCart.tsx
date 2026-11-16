"use client";

import { useState } from "react";

export function AddToCart({ slug, name }: { slug: string; name: string }) {
  const [added, setAdded] = useState(false);
  function add() {
    const current = JSON.parse(localStorage.getItem("cbh_cart") || "[]") as { slug: string; name: string; qty: number }[];
    const list = Array.isArray(current) ? current : [];
    const existing = list.find((item) => item.slug === slug);
    const next = existing
      ? list.map((item) => (item.slug === slug ? { ...item, qty: item.qty + 1 } : item))
      : [...list, { slug, name, qty: 1 }];
    localStorage.setItem("cbh_cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cbh-cart"));
    setAdded(true);
  }
  return (
    <button type="button" onClick={add} className="btn bg-[#0c3c8c] text-white">
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
