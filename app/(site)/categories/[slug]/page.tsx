import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: `${category.name} in Zimbabwe`, description: category.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { products: { where: { active: true }, include: { category: true } } },
  });
  if (!category || !category.active) notFound();
  return (
    <div className="wrap py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-stone">Category</p>
      <h1 className="display mt-2 text-5xl">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-stone">{category.description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {category.products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
