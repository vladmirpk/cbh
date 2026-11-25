import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { unitPrice } from "@/lib/types";
import { SolarConfigurator } from "@/components/site/SolarConfigurator";

export const metadata: Metadata = {
  title: "Solar system configurator",
  description: "Get an indicative CBH solar kit recommendation, then request a quote.",
};

export default async function SolarConfiguratorPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { category: { slug: { contains: "solar" } } },
        { tags: { contains: "solar" } },
        { name: { contains: "Inverter" } },
        { name: { contains: "Battery" } },
        { name: { contains: "Panel" } },
      ],
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  const catalog = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    unit: product.unit,
    price: unitPrice(product),
    moq: product.moq,
    weightKg: product.weightKg,
    stockStatus: product.stockStatus,
    kind: inferKind(product.name, product.tags),
    capacity: inferCapacity(product.name, product.specs),
  }));

  return (
    <div className="wrap py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-stone">Solar & energy</p>
      <h1 className="display mt-2 text-5xl text-ink">System configurator</h1>
      <p className="mt-3 max-w-xl text-stone">Enter usage. Get a kit. Then quote.</p>
      {catalog.length ? (
        <div className="mt-8">
          <SolarConfigurator catalog={catalog} />
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-line bg-white p-6 text-stone">
          No solar catalogue items yet.{" "}
          <Link href="/upcoming" className="font-semibold text-ink">Register interest</Link>
        </p>
      )}
      <p className="mt-6 text-sm text-stone">Indicative only. From {money(0)} catalogue prices — CBH confirms final design.</p>
    </div>
  );
}

function inferKind(name: string, tags: string) {
  const hay = `${name} ${tags}`.toLowerCase();
  if (hay.includes("inverter")) return "inverter" as const;
  if (hay.includes("batter")) return "battery" as const;
  if (hay.includes("panel") || hay.includes("module")) return "panel" as const;
  return "other" as const;
}

function inferCapacity(name: string, specs: string) {
  const fromName = name.match(/(\d+(?:\.\d+)?)\s*(kva|kwh|w)\b/i);
  if (fromName) {
    const n = Number(fromName[1]);
    const unit = fromName[2].toLowerCase();
    if (unit === "w") return n / 1000;
    return n;
  }
  try {
    const parsed = JSON.parse(specs) as Array<{ label: string; value: string }>;
    for (const spec of parsed) {
      const m = `${spec.label} ${spec.value}`.match(/(\d+(?:\.\d+)?)\s*(kva|kwh|w)\b/i);
      if (m) {
        const n = Number(m[1]);
        return m[2].toLowerCase() === "w" ? n / 1000 : n;
      }
    }
  } catch {
    /* ignore */
  }
  return 0;
}
