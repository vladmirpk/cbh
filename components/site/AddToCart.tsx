"use client";

import { useState } from "react";

export function AddToCart({
  slug,
  name,
  image,
}: {
  slug: string;
  name: string;
  image?: string | null;
}) {
  const [added, setAdded] = useState(false);
  function add() {
    const current = JSON.parse(localStorage.getItem("cbh_cart") || "[]") as {
      slug: string;
      name: string;
      image?: string | null;
      qty: number;
    }[];
    const list = Array.isArray(current) ? current : [];
    const existing = list.find((item) => item.slug === slug);
    const next = existing
      ? list.map((item) =>
          item.slug === slug
            ? { ...item, qty: item.qty + 1, image: item.image || image || null, name }
            : item,
        )
      : [...list, { slug, name, image: image || null, qty: 1 }];
    localStorage.setItem("cbh_cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cbh-cart"));
    setAdded(true);
  }
  return (
    <button type="button" onClick={add} className="btn btn-ink">
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
