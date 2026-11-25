"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { PRODUCT_STATUSES } from "@/lib/types";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  unit: string;
  price: number;
  promoPrice: number | null;
  stockStatus: string;
  stockQty: number | null;
  brand: string | null;
  colour: string | null;
  sizeLabel: string | null;
  images: string;
  category: { name: string; slug: string };
};

type Filters = {
  q: string;
  category: string;
  status: string;
  brand: string;
  colour: string;
  size: string;
  tag: string;
  min: string;
  max: string;
};

export function ProductBrowse({
  products,
  categories,
  brands,
  colours,
  sizes,
  tags,
  initial,
}: {
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  colours: string[];
  sizes: string[];
  tags: string[];
  initial: Filters;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(initial);

  const activeCount = useMemo(() => {
    return [
      initial.q,
      initial.category,
      initial.status,
      initial.brand,
      initial.colour,
      initial.size,
      initial.tag,
      initial.min,
      initial.max,
    ].filter(Boolean).length;
  }, [initial]);

  const chips = useMemo(() => {
    const list: { key: keyof Filters; label: string }[] = [];
    if (initial.q) list.push({ key: "q", label: `“${initial.q}”` });
    if (initial.category) {
      const name = categories.find((c) => c.slug === initial.category)?.name || initial.category;
      list.push({ key: "category", label: name });
    }
    if (initial.status) {
      const name = PRODUCT_STATUSES.find((s) => s.id === initial.status)?.label || initial.status;
      list.push({ key: "status", label: name });
    }
    if (initial.brand) list.push({ key: "brand", label: initial.brand });
    if (initial.colour) list.push({ key: "colour", label: initial.colour });
    if (initial.size) list.push({ key: "size", label: initial.size });
    if (initial.tag) list.push({ key: "tag", label: `#${initial.tag}` });
    if (initial.min) list.push({ key: "min", label: `From US$${initial.min}` });
    if (initial.max) list.push({ key: "max", label: `To US$${initial.max}` });
    return list;
  }, [initial, categories]);

  function buildUrl(next: Filters) {
    const params = new URLSearchParams();
    (Object.keys(next) as (keyof Filters)[]).forEach((key) => {
      const value = next[key].trim();
      if (value) params.set(key === "size" ? "size" : key, value);
    });
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  function apply(event?: FormEvent) {
    event?.preventDefault();
    setOpen(false);
    router.push(buildUrl(draft));
  }

  function clearAll() {
    const empty: Filters = { q: "", category: "", status: "", brand: "", colour: "", size: "", tag: "", min: "", max: "" };
    setDraft(empty);
    setOpen(false);
    router.push("/products");
  }

  function removeChip(key: keyof Filters) {
    const next = { ...initial, [key]: "" };
    router.push(buildUrl(next));
  }

  function quickCategory(slug: string) {
    const next = { ...initial, category: initial.category === slug ? "" : slug };
    router.push(buildUrl(next));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Catalogue</p>
          <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">Products</h1>
        </div>
        <p className="text-sm font-semibold text-stone">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Slim discovery bar — not a wall of fields */}
      <div className="mt-6 flex items-center gap-2">
        <form
          className="flex min-w-0 flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <label className="sr-only" htmlFor="product-search">Search products</label>
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input
              id="product-search"
              className="field h-11 pl-9"
              value={draft.q}
              onChange={(event) => setDraft((prev) => ({ ...prev, q: event.target.value }))}
              placeholder="Search the yard…"
            />
          </div>
        </form>
        <button
          type="button"
          onClick={() => {
            setDraft(initial);
            setOpen(true);
          }}
          className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-bold transition ${
            activeCount
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-ink hover:bg-plaster"
          }`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
          {activeCount ? (
            <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] ${activeCount && "bg-gold text-[#10233f]"}`}>
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Quick category strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => quickCategory("")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
            !initial.category ? "bg-ink text-white" : "border border-line bg-white text-stone"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => quickCategory(category.slug)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              initial.category === category.slug ? "bg-ink text-white" : "border border-line bg-white text-stone"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {chips.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-plaster px-3 py-1 text-xs font-bold text-ink"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="text-xs font-bold text-stone hover:text-ink">
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!products.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
          <p className="font-extrabold text-ink">No products match</p>
          <p className="mt-2 text-sm text-stone">Try clearing filters or searching a different term.</p>
          <button type="button" onClick={clearAll} className="btn btn-ink mt-4 h-10 text-sm">
            Reset filters
          </button>
        </div>
      ) : null}

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#071a4a]/40 backdrop-blur-[1px]"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[min(88vh,640px)] overflow-y-auto rounded-t-[1.6rem] border border-line bg-white shadow-[0_-20px_60px_rgba(7,26,74,0.2)] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(24rem,100vw)] md:rounded-none md:rounded-l-[1.4rem]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Refine</p>
                <h2 className="text-lg font-extrabold text-ink">Filters</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:bg-plaster"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={apply} className="grid gap-4 px-5 py-5 pb-28 md:pb-5">
              <label>
                <span className="label">Search</span>
                <input
                  className="field"
                  value={draft.q}
                  onChange={(event) => setDraft((prev) => ({ ...prev, q: event.target.value }))}
                  placeholder="Name, SKU, brand…"
                />
              </label>
              <label>
                <span className="label">Category</span>
                <select
                  className="field"
                  value={draft.category}
                  onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Status</span>
                <select
                  className="field"
                  value={draft.status}
                  onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="">Any status</option>
                  {PRODUCT_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="label">Brand</span>
                  <select
                    className="field"
                    value={draft.brand}
                    onChange={(event) => setDraft((prev) => ({ ...prev, brand: event.target.value }))}
                  >
                    <option value="">Any</option>
                    {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </label>
                <label>
                  <span className="label">Colour</span>
                  <select
                    className="field"
                    value={draft.colour}
                    onChange={(event) => setDraft((prev) => ({ ...prev, colour: event.target.value }))}
                  >
                    <option value="">Any</option>
                    {colours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
                  </select>
                </label>
                <label>
                  <span className="label">Size</span>
                  <select
                    className="field"
                    value={draft.size}
                    onChange={(event) => setDraft((prev) => ({ ...prev, size: event.target.value }))}
                  >
                    <option value="">Any</option>
                    {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </label>
                <label>
                  <span className="label">Tag</span>
                  <select
                    className="field"
                    value={draft.tag}
                    onChange={(event) => setDraft((prev) => ({ ...prev, tag: event.target.value }))}
                  >
                    <option value="">Any</option>
                    {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                </label>
                <label>
                  <span className="label">Min US$</span>
                  <input
                    className="field"
                    value={draft.min}
                    onChange={(event) => setDraft((prev) => ({ ...prev, min: event.target.value }))}
                    inputMode="decimal"
                  />
                </label>
                <label>
                  <span className="label">Max US$</span>
                  <input
                    className="field"
                    value={draft.max}
                    onChange={(event) => setDraft((prev) => ({ ...prev, max: event.target.value }))}
                    inputMode="decimal"
                  />
                </label>
              </div>
              <div className="fixed inset-x-0 bottom-0 z-10 flex gap-2 border-t border-line bg-white p-4 md:static md:border-0 md:bg-transparent md:p-0">
                <button type="button" onClick={clearAll} className="btn btn-ghost h-11 flex-1 border border-line text-sm">
                  Clear
                </button>
                <button type="submit" className="btn btn-primary h-11 flex-1 text-sm">
                  Show results
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}

      {/* Quiet path for SEO / no-JS — still works */}
      <noscript>
        <p className="mt-6 text-sm">
          <Link href="/products" className="font-bold text-ink">Browse all products</Link>
        </p>
      </noscript>
    </div>
  );
}
