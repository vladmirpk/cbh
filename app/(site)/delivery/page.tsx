import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCommerce } from "@/lib/queries";
import { money } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery",
  description: "How CBH estimates delivery from the Harare yard by zone, distance, vehicle and fuel.",
};

export default async function DeliveryPage() {
  const { settings, vehicles, zones } = await getCommerce();
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="wrap py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-stone">From {settings.depotName}</p>
      <h1 className="display mt-2 max-w-3xl text-5xl">Delivery is a rate card, not a guess buried in the code.</h1>
      <p className="mt-4 max-w-2xl text-stone">
        Provisional delivery is base charge + distance + the vehicle that can carry the load, then fuel and any extra the yard has set. Staff change every number from the dashboard.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Base", money(settings.baseCharge)],
          ["Per kilometre", money(settings.perKm)],
          ["Minimum", money(settings.minCharge)],
          ["Fuel surcharge", `${settings.fuelSurchargePct}%`],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-stone">{label}</p>
            <p className="display mt-2 text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="display mt-12 text-3xl">Vehicles</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-stone">
            <tr><th className="py-2">Vehicle</th><th>Capacity</th><th>Load charge</th></tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t border-line">
                <td className="py-3">{vehicle.name}</td>
                <td>{vehicle.capacityKg.toLocaleString()} kg</td>
                <td>{money(vehicle.surcharge)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="display mt-12 text-3xl">Zones on the card</h2>
      <p className="mt-2 text-sm text-stone">{zones.length} suburbs and towns, measured from {settings.depotAddress}. A pin or shared location uses road-adjusted distance instead of the zone figure.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {zones.map((zone) => (
          <span key={zone.id} className="rounded-full border border-line bg-card px-3 py-1 text-sm">{zone.name} · {zone.distanceKm} km</span>
        ))}
      </div>
      <Link href="/quote" className="btn btn-primary mt-8">Price a delivery</Link>
      <h2 className="display mt-14 text-3xl">Questions</h2>
      <div className="mt-4 grid gap-3">
        {faqs.map((faq) => (
          <details key={faq.id} className="panel p-4">
            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-stone">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
