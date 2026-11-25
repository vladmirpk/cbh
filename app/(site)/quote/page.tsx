import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCommerce, ratesFrom } from "@/lib/queries";
import { QUOTABLE_STATUSES, parseJson } from "@/lib/types";
import { QuoteWizard } from "@/components/site/QuoteWizard";

export const metadata: Metadata = {
  title: "Provisional quotation",
  description: "Price CBH materials and delivery to your suburb.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; src?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const { settings, vehicles, zones } = await getCommerce();
  const products = await prisma.product.findMany({
    where: { active: true, stockStatus: { in: [...QUOTABLE_STATUSES] } },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="wrap py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-stone">Quotation</p>
      <h1 className="display mt-2 max-w-3xl text-5xl leading-none">Get a quote</h1>
      <p className="mt-3 max-w-xl text-stone">Add products, pick the suburb, submit.</p>
      <div className="mt-8">
        <QuoteWizard
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            unit: product.unit,
            price: product.price,
            promoPrice: product.promoPrice,
            moq: product.moq,
            weightKg: product.weightKg,
            stockStatus: product.stockStatus,
            category: product.category.name,
            image: parseJson<string[]>(product.images, [])[0] || null,
          }))}
          zones={zones}
          vehicles={vehicles.map((vehicle) => ({ name: vehicle.name, capacityKg: vehicle.capacityKg, surcharge: vehicle.surcharge }))}
          rates={ratesFrom(settings)}
          depot={{ name: settings.depotName, lat: settings.depotLat, lng: settings.depotLng }}
          mapsKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || undefined}
          initialSlug={sp.product}
          initialSource={sp.src}
          fromCart={sp.from === "cart"}
        />
      </div>
    </div>
  );
}
