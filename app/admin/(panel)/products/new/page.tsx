import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageProducts } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return <Denied />;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <h1 className="display text-4xl text-ink">New listing</h1>
      <div className="mt-6"><ProductForm categories={categories} /></div>
    </div>
  );
}
