import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Cover } from "@/components/site/Cover";

export const metadata: Metadata = { title: "Promotions", description: "Current CBH offers, campaigns and calls to action." };

export default async function PromotionsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const promotions = await prisma.promotion.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
  const live = promotions.filter((item) => !item.expiresAt || item.expiresAt >= today);
  return (
    <div className="wrap py-12">
      <h1 className="display text-5xl">Promotions</h1>
      <p className="mt-3 max-w-xl text-stone">Current offers. Tap one to continue.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {live.map((item) => (
          <Link key={item.id} href={`/promotions/${item.slug}?src=advertisement`} className="overflow-hidden rounded-[1.5rem] border border-line bg-card">
            <div className="aspect-[16/9]"><Cover src={item.image} alt="" /></div>
            <div className="p-5">
              {item.discount ? <p className="text-xs uppercase tracking-[0.16em] text-brick">{item.discount}</p> : null}
              <h2 className="display mt-2 text-3xl">{item.headline}</h2>
              <p className="mt-2 text-sm text-stone">{item.description}</p>
              {item.targetArea ? <p className="mt-2 text-xs text-stone">Aimed at {item.targetArea}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
