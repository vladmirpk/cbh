"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { Cover } from "./Cover";

type CartItem = { slug: string; name: string; image?: string | null; qty: number };

export function CartFlyout() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("cbh_cart") || "[]");
        setItems(Array.isArray(raw) ? raw : []);
      } catch {
        setItems([]);
      }
    };
    read();
    window.addEventListener("cbh-cart", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("cbh-cart", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent | TouchEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function scheduleClose() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  }

  function cancelClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }

  const count = items.length;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        scheduleClose();
      }}
    >
      <Link
        href="/cart"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:bg-plaster"
        aria-label={count ? `Cart, ${count} items` : "Cart"}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(event) => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <ShoppingCart size={18} />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        ) : null}
      </Link>

      {open ? (
        <>
          {/* Mobile: pin to viewport so the panel never spills off-screen */}
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#071a4a]/25 md:hidden"
            aria-label="Close cart preview"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed left-3 right-3 top-14 z-50 max-h-[min(70vh,28rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_50px_rgba(7,26,74,0.18)] sm:top-16 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-[22rem] md:max-w-[calc(100vw-1.5rem)]"
            role="dialog"
            aria-label="Cart preview"
          >
            <div className="flex items-center justify-between border-b border-line bg-plaster px-4 py-3">
              <p className="text-sm font-extrabold text-ink">
                Cart{count ? ` · ${count}` : ""}
              </p>
              <div className="flex items-center gap-3">
                <Link href="/cart" className="text-xs font-bold text-ink hover:underline" onClick={() => setOpen(false)}>
                  View cart
                </Link>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-stone hover:bg-white hover:text-ink md:hidden"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {count === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-stone">Nothing in the cart yet.</p>
                <Link href="/products" className="mt-3 inline-flex text-sm font-bold text-ink" onClick={() => setOpen(false)}>
                  Browse products →
                </Link>
              </div>
            ) : (
              <>
                <ul className="max-h-[min(40vh,16rem)] overflow-y-auto md:max-h-72">
                  {items.map((item) => (
                    <li key={item.slug} className="flex gap-3 border-b border-line px-4 py-3 last:border-b-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#e8eef8]">
                        <Cover src={item.image} alt="" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.slug}`}
                          className="line-clamp-2 text-sm font-bold text-ink hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-stone">Qty {item.qty}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2 border-t border-line bg-plaster p-3">
                  <Link href="/quote?from=cart" className="btn btn-primary h-10 text-sm" onClick={() => setOpen(false)}>
                    Quote these items
                  </Link>
                  <Link href="/cart" className="btn btn-ghost h-10 border border-line text-sm" onClick={() => setOpen(false)}>
                    Open cart
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
