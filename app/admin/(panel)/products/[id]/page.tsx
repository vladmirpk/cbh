import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageProducts } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return <Denied />;
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="display text-4xl text-ink">{product.name}</h1>
      <p className="mt-2 text-sm text-stone">{product.views} views · {product.enquiries} enquiries</p>
      <div className="mt-6"><ProductForm product={product} categories={categories} /></div>
    </div>
  );
}
