import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Cover } from "@/components/site/Cover";
import { getCommerce } from "@/lib/queries";
import { waLink } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await prisma.promotion.findUnique({ where: { slug } });
  if (!promotion) return {};
  return { title: promotion.title, description: promotion.description };
}

export default async function PromotionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promotion = await prisma.promotion.findUnique({ where: { slug } });
  if (!promotion || !promotion.active) notFound();
  const { site } = await getCommerce();
  const href = promotion.cta === "whatsapp"
    ? waLink(site.whatsapp, `Hello CBH, I saw the offer: ${promotion.headline}`)
    : `${promotion.ctaHref || "/quote"}${promotion.ctaHref?.includes("?") ? "&" : "?"}src=advertisement`;
  return (
    <div className="bg-ink text-plaster">
      <div className="wrap grid items-center gap-8 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#f5c400]">{promotion.discount || "CBH offer"}</p>
          <h1 className="display mt-3 text-5xl leading-none">{promotion.headline}</h1>
          <p className="mt-4 text-lg text-white/85">{promotion.description}</p>
          {promotion.priceLabel ? <p className="mt-4 text-2xl">{promotion.priceLabel}</p> : null}
          <div className="mt-8 flex gap-2">
            <a className="btn btn-primary" href={href}>{ctaLabel(promotion.cta)}</a>
            <Link className="btn btn-ghost border-white/20" href="/products">Browse products</Link>
          </div>
          {promotion.expiresAt ? <p className="mt-4 text-sm text-white/70">Offer runs until {promotion.expiresAt}</p> : null}
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-[1.6rem]"><Cover src={promotion.image} alt={promotion.title} /></div>
      </div>
    </div>
  );
}

function ctaLabel(cta: string) {
  const labels: Record<string, string> = {
    quote: "Get a quote",
    buy: "Price this load",
    interest: "Register interest",
    whatsapp: "WhatsApp us",
    delivery: "Request delivery price",
    preorder: "Pre-order",
  };
  return labels[cta] ?? "Continue";
}
