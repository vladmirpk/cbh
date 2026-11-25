"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { money } from "@/lib/format";
import { labelOf, PRODUCT_STATUSES } from "@/lib/types";
import { deleteProduct, setListingVisible, updateListingPrice } from "@/lib/actions/admin";
import { Cover } from "@/components/site/Cover";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PreviewSheet } from "@/components/admin/PreviewSheet";

export type ListingRow = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  stockStatus: string;
  active: boolean;
  description: string;
  category: string;
  image: string | null;
};

export function CatalogueBoard({ products }: { products: ListingRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );
  const visible = products.filter((product) => {
    const haystack = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-ink">Catalogue</h1>
          <p className="mt-2 max-w-xl text-sm text-stone">
            Preview, edit, hide, or remove listings. Removals always ask for confirmation.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/api/export/products" className="btn btn-ghost">Download CSV</Link>
          <Link href="/admin/products/new" className="btn btn-primary">Add listing</Link>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
        <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or SKU" />
        <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((name) => <option key={name}>{name}</option>)}
        </select>
      </div>
      <p className="mt-4 text-sm text-stone">{visible.length} listing{visible.length === 1 ? "" : "s"}</p>
      <div className="mt-3 grid gap-3">
        {visible.map((product) => (
          <article key={product.id} className="grid gap-4 rounded-2xl border border-line bg-white p-3 shadow-[0_10px_30px_rgba(12,60,140,0.05)] md:grid-cols-[96px_1fr_280px] md:items-center">
            <div className="h-24 overflow-hidden rounded-xl bg-[#e8eef8]">
              <Cover src={product.image} alt={product.name} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">{product.category} · {product.sku}</p>
              <h2 className="truncate text-lg font-extrabold text-ink">{product.name}</h2>
              <p className="line-clamp-1 text-sm text-stone">{product.description}</p>
              <p className="mt-1 text-xs font-semibold text-ink">
                {labelOf(PRODUCT_STATUSES, product.stockStatus)}
                {product.active ? "" : " · hidden from the site"}
                {" · "}now {money(product.promoPrice ?? product.price)}
              </p>
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <PreviewSheet
                    title={product.name}
                    editHref={`/admin/products/${product.id}`}
                    previewHref={`/products/${product.slug}`}
                    lines={[
                      { label: "SKU", value: product.sku },
                      { label: "Category", value: product.category },
                      { label: "Status", value: labelOf(PRODUCT_STATUSES, product.stockStatus) },
                      { label: "Price", value: money(product.price) },
                      { label: "Sale", value: product.promoPrice != null ? money(product.promoPrice) : "—" },
                      { label: "Visibility", value: product.active ? "On site" : "Hidden" },
                    ]}
                  />
                  <RowActions
                    previewHref={`/products/${product.slug}`}
                    previewLabel="Live"
                    previewExternal
                    editHref={`/admin/products/${product.id}`}
                    deleteAction={deleteProduct}
                    deleteFields={{ id: product.id }}
                    deleteLabel="Remove"
                    deleteConfirm={{
                      title: `Remove ${product.name}?`,
                      message: "This deletes the listing from the catalogue. Shoppers will no longer see it.",
                      detail: product.sku,
                      confirmLabel: "Remove listing",
                      cancelLabel: "Keep listing",
                      tone: "danger",
                      image: product.image,
                    }}
                  />
                  <ConfirmAction
                    action={setListingVisible}
                    fields={{ id: product.id, active: product.active ? "no" : "yes" }}
                    label={product.active ? "Hide" : "Show"}
                    className="inline-flex h-8 items-center rounded-full border border-line px-3 text-xs font-bold text-ink hover:bg-plaster"
                    confirm={{
                      title: product.active ? `Hide ${product.name}?` : `Show ${product.name}?`,
                      message: product.active
                        ? "The product stays in the desk but disappears from the public catalogue."
                        : "This puts the product back on the public catalogue.",
                      confirmLabel: product.active ? "Hide from site" : "Show on site",
                      cancelLabel: "Not now",
                      tone: product.active ? "danger" : "primary",
                      image: product.image,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <form action={updateListingPrice} className="grid grid-cols-2 gap-2">
                <input type="hidden" name="id" value={product.id} />
                <label className="text-xs font-bold text-stone">
                  Price
                  <input className="field mt-1" name="price" type="number" min="0" step="0.01" defaultValue={product.price} />
                </label>
                <label className="text-xs font-bold text-stone">
                  Sale price
                  <input className="field mt-1" name="promoPrice" type="number" min="0" step="0.01" defaultValue={product.promoPrice ?? ""} placeholder="None" />
                </label>
                <button className="btn btn-ink col-span-2">Save price</button>
              </form>
            </div>
          </article>
        ))}
        {visible.length === 0 ? <p className="rounded-2xl border border-line bg-white p-6 text-sm text-stone">No listings match that search.</p> : null}
      </div>
    </div>
  );
}
