import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCT_STATUSES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Product yard",
  description: "Search CBH bricks, pavers, kerbs, building materials, lighting and upcoming solar products.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(sp.category ? { category: { slug: sp.category } } : {}),
      ...(sp.status ? { stockStatus: sp.status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { sku: { contains: q } },
              { description: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  const visible = sp.tag ? products.filter((product) => product.tags.toLowerCase().includes(sp.tag!.toLowerCase())) : products;
  return (
    <div className="wrap py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Catalogue</p>
      <h1 className="display mt-2 text-5xl text-ink">Products</h1>
      <p className="mt-3 max-w-xl text-stone">Search and filter, then quote or add to cart.</p>
      <form className="mt-8 grid gap-3 md:grid-cols-[1.4fr_.8fr_.8fr_auto]" action="/products">
        <input className="field" name="q" defaultValue={q} placeholder="Search pavers, bricks, solar…" />
        <select className="field" name="category" defaultValue={sp.category ?? ""}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <select className="field" name="status" defaultValue={sp.status ?? ""}>
          <option value="">Any status</option>
          {PRODUCT_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
        </select>
        <button className="btn btn-ink">Filter</button>
      </form>
      <p className="mt-6 text-sm text-stone">{visible.length} product{visible.length === 1 ? "" : "s"}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
