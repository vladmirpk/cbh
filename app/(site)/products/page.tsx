import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductBrowse } from "@/components/site/ProductBrowse";
import { unitPrice } from "@/lib/types";

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

  const [categories, facetRows, filtered] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      select: { brand: true, colour: true, sizeLabel: true, tags: true },
    }),
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
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
  ]);

  const brands = [...new Set(facetRows.map((p) => p.brand).filter(Boolean) as string[])].sort();
  const colours = [...new Set(facetRows.map((p) => p.colour).filter(Boolean) as string[])].sort();
  const sizes = [...new Set(facetRows.map((p) => p.sizeLabel).filter(Boolean) as string[])].sort();
  const tags = [...new Set(facetRows.flatMap((p) => p.tags.split(/[, ]+/).map((t) => t.trim()).filter(Boolean)))].sort();

  let visible = sp.tag
    ? filtered.filter((product) => product.tags.toLowerCase().includes(sp.tag!.toLowerCase()))
    : filtered;
  if (Number.isFinite(min as number)) visible = visible.filter((p) => unitPrice(p) >= (min as number));
  if (Number.isFinite(max as number)) visible = visible.filter((p) => unitPrice(p) <= (max as number));

  return (
    <div className="wrap py-8 sm:py-10">
      <ProductBrowse
        products={visible}
        categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        brands={brands}
        colours={colours}
        sizes={sizes}
        tags={tags}
        initial={{
          q,
          category: sp.category ?? "",
          status: sp.status ?? "",
          brand: sp.brand ?? "",
          colour: sp.colour ?? "",
          size: sp.size ?? "",
          tag: sp.tag ?? "",
          min: sp.min ?? "",
          max: sp.max ?? "",
        }}
      />
    </div>
  );
}
