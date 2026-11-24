"use client";

import { useState } from "react";
import { ConfirmSheet, type ConfirmPayload } from "./ConfirmSheet";

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
  const [confirm, setConfirm] = useState<ConfirmPayload | null>(null);

  function ask() {
    setConfirm({
      title: "Add to cart?",
      message: "Confirm you want to add this product to your cart so you can quote or order it next.",
      detail: name,
      image: image || null,
      confirmLabel: "Yes, add to cart",
      cancelLabel: "Keep browsing",
    });
  }

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
    setConfirm(null);
  }

  return (
    <>
      <button type="button" onClick={ask} className="btn btn-ink">
        {added ? "Added to cart" : "Add to cart"}
      </button>
      <ConfirmSheet
        open={Boolean(confirm)}
        payload={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={add}
      />
    </>
  );
}
