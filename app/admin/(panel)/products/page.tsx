import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageProducts } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { parseJson } from "@/lib/types";
import { CatalogueBoard } from "@/components/admin/CatalogueBoard";

export default async function AdminProductsPage() {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return <Denied />;
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  return (
    <CatalogueBoard
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        price: product.price,
        promoPrice: product.promoPrice,
        stockStatus: product.stockStatus,
        active: product.active,
        description: product.description,
        category: product.category.name,
        image: parseJson<string[]>(product.images, [])[0] ?? null,
      }))}
    />
  );
}
