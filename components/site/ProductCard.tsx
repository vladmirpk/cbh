import Link from "next/link";
import { money } from "@/lib/format";
import { parseJson, unitPrice } from "@/lib/types";
import { StatusPill } from "../ui";
import { Cover } from "./Cover";

export function ProductCard({
  product,
}: {
  product: {
    name: string;
    slug: string;
    sku: string;
    description: string;
    unit: string;
    price: number;
    promoPrice: number | null;
    stockStatus: string;
    images: string;
    category: { name: string };
  };
}) {
  const image = parseJson<string[]>(product.images, [])[0];
  const price = unitPrice(product);
  const promo = product.stockStatus === "promotional" && product.promoPrice != null;
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(12,60,140,0.06)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e8eef8]">
        <Cover src={image} alt={product.name} className="transition duration-700 group-hover:scale-105" />
        <div className="absolute left-3 top-3">
          <StatusPill status={product.stockStatus} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">{product.category.name} · {product.sku}</p>
        <h3 className="mt-1 text-xl font-extrabold leading-tight text-ink">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-stone">{product.description}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-lg font-extrabold text-ink">
            {promo ? <span className="mr-2 text-sm font-semibold text-stone line-through">{money(product.price)}</span> : null}
            {money(price)}
            <span className="text-sm font-semibold text-stone"> / {product.unit}</span>
          </p>
          <span className="text-sm font-bold text-ink">View</span>
        </div>
      </div>
    </Link>
  );
}
