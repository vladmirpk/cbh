import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Cover } from "@/components/site/Cover";

export const metadata: Metadata = {
  title: "Product categories",
  description: "Browse CBH bricks, pavers, building materials, solar and more by category.",
};

export default async function CategoriesIndexPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return (
    <div className="wrap py-12">
      <h1 className="display text-5xl text-ink">Categories</h1>
      <p className="mt-3 max-w-xl text-stone">Pick a line, then quote or enquire.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(12,60,140,0.05)]"
          >
            <div className="aspect-[16/10] bg-[#e8eef8]">
              <Cover src={category.image} alt={category.name} />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-extrabold text-ink">{category.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-stone">{category.description}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone">
                {category._count.products} product{category._count.products === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
