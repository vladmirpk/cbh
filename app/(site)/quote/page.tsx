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
    <div className="wrap py-8 sm:py-10">
      <div className="overflow-hidden rounded-[1.6rem] border border-line bg-ink px-5 py-6 text-white sm:px-8 sm:py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">Provisional quotation</p>
        <h1 className="display mt-2 max-w-2xl text-4xl leading-none sm:text-5xl">Price materials + delivery</h1>
        <p className="mt-3 max-w-xl text-sm text-white/75">
          Add lines, set quantities, pick your suburb. CBH confirms the formal figure.
        </p>
        <ol className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-white/80">
          <li className="rounded-full bg-white/10 px-3 py-1.5">1 · Products</li>
          <li className="rounded-full bg-white/10 px-3 py-1.5">2 · Location</li>
          <li className="rounded-full bg-white/10 px-3 py-1.5">3 · Your details</li>
        </ol>
      </div>
      <div className="mt-6">
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
