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
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_20px_rgba(12,60,140,0.04)]"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-[#e8eef8]">
        <Cover src={image} alt="" className="transition duration-500 group-hover:scale-105" />
        <div className="absolute left-2 top-2">
          <StatusPill status={product.stockStatus} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone">{product.category.name}</p>
        <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink">{product.name}</h3>
        <p className="mt-auto pt-2 text-sm font-extrabold text-ink">
          {promo ? <span className="mr-1.5 text-xs font-semibold text-stone line-through">{money(product.price)}</span> : null}
          {money(price)}
          <span className="text-xs font-semibold text-stone"> / {product.unit}</span>
        </p>
      </div>
    </Link>
  );
}
