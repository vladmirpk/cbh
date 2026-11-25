import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCT_STATUSES, unitPrice } from "@/lib/types";

export const metadata: Metadata = {
  title: "Products",
  description: "Search CBH bricks, pavers, building materials, lighting and solar products.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    tag?: string;
    brand?: string;
    colour?: string;
    size?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const min = sp.min ? Number(sp.min) : null;
  const max = sp.max ? Number(sp.max) : null;
  const [categories, allProducts] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(sp.category ? { category: { slug: sp.category } } : {}),
        ...(sp.status ? { stockStatus: sp.status } : {}),
        ...(sp.brand ? { brand: { equals: sp.brand } } : {}),
        ...(sp.colour ? { colour: { equals: sp.colour } } : {}),
        ...(sp.size ? { sizeLabel: { equals: sp.size } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { sku: { contains: q } },
                { description: { contains: q } },
                { tags: { contains: q } },
                { brand: { contains: q } },
                { colour: { contains: q } },
                { sizeLabel: { contains: q } },
                { modelNumber: { contains: q } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const brands = [...new Set(allProducts.map((p) => p.brand).filter(Boolean) as string[])].sort();
  const colours = [...new Set(allProducts.map((p) => p.colour).filter(Boolean) as string[])].sort();
  const sizes = [...new Set(allProducts.map((p) => p.sizeLabel).filter(Boolean) as string[])].sort();
  const tags = [...new Set(allProducts.flatMap((p) => p.tags.split(/[, ]+/).map((t) => t.trim()).filter(Boolean)))].sort();
  let visible = sp.tag
    ? allProducts.filter((product) => product.tags.toLowerCase().includes(sp.tag!.toLowerCase()))
    : allProducts;
  if (Number.isFinite(min as number)) visible = visible.filter((p) => unitPrice(p) >= (min as number));
  if (Number.isFinite(max as number)) visible = visible.filter((p) => unitPrice(p) <= (max as number));

  return (
    <div className="wrap py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Catalogue</p>
      <h1 className="display mt-2 text-5xl text-ink">Products</h1>
      <p className="mt-3 max-w-xl text-stone">Search and filter, then quote or add to cart.</p>
      <form className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-4" action="/products">
        <input className="field md:col-span-2" name="q" defaultValue={q} placeholder="Search pavers, bricks, solar…" />
        <select className="field" name="category" defaultValue={sp.category ?? ""}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <select className="field" name="status" defaultValue={sp.status ?? ""}>
          <option value="">Any status</option>
          {PRODUCT_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
        </select>
        <select className="field" name="brand" defaultValue={sp.brand ?? ""}>
          <option value="">Any brand</option>
          {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <select className="field" name="colour" defaultValue={sp.colour ?? ""}>
          <option value="">Any colour</option>
          {colours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
        </select>
        <select className="field" name="size" defaultValue={sp.size ?? ""}>
          <option value="">Any size</option>
          {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <select className="field" name="tag" defaultValue={sp.tag ?? ""}>
          <option value="">Any tag</option>
          {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <input className="field" name="min" defaultValue={sp.min ?? ""} placeholder="Min US$" inputMode="decimal" />
        <input className="field" name="max" defaultValue={sp.max ?? ""} placeholder="Max US$" inputMode="decimal" />
        <button className="btn btn-ink">Filter</button>
      </form>
      <p className="mt-6 text-sm text-stone">{visible.length} product{visible.length === 1 ? "" : "s"}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {visible.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
