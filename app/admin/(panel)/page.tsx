import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canSeeFinance } from "@/lib/roles";
import { money } from "@/lib/format";
import { LEAD_SOURCES, parseJson } from "@/lib/types";
import { Cover } from "@/components/site/Cover";

export default async function DashboardPage() {
  const user = await requireUser();
  const finance = canSeeFinance(user.role);
  const leadWhere = user.role === "salesperson" ? { OR: [{ assignedToId: user.id }, { assignedToId: null }] } : {};
  const [leads, quotes, orders, products, notifications] = await Promise.all([
    prisma.lead.findMany({ where: leadWhere }),
    prisma.quote.findMany(),
    prisma.order.findMany(),
    prisma.product.findMany({ where: { active: true }, orderBy: { views: "desc" }, take: 5 }),
    prisma.notification.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const won = leads.filter((lead) => lead.status === "won").length;
  const openQuotes = quotes.filter((quote) => {
    const lead = leads.find((item) => item.id === quote.leadId);
    return lead ? lead.status !== "lost" : true;
  });
  const quoteValue = openQuotes.reduce((sum, quote) => sum + quote.total, 0);
  const bySource = LEAD_SOURCES.map((source) => ({ source, count: leads.filter((lead) => lead.source === source).length })).filter((item) => item.count > 0);
  const maxSource = Math.max(1, ...bySource.map((item) => item.count));
  const byPlace = Object.entries(
    leads.reduce<Record<string, number>>((map, lead) => {
      const key = lead.location.split(",")[0] || "Unknown";
      map[key] = (map[key] ?? 0) + 1;
      return map;
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="display text-4xl">Today on the desk</h1>
        <p className="mt-2 text-sm text-stone">Product views and leads live here. Connect Google Analytics with NEXT_PUBLIC_GA_ID when you want visitor sessions as well.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Leads", String(leads.length)],
          ["Won", String(won)],
          ["Conversion", leads.length ? `${Math.round((won / leads.length) * 100)}%` : "0%"],
          ["Quote value", finance ? money(quoteValue) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-stone">{label}</p>
            <p className="display mt-2 text-4xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="display text-2xl">Leads by source</h2>
          <div className="mt-4 grid gap-2">
            {bySource.map((item) => (
              <div key={item.source} className="grid grid-cols-[110px_1fr_24px] items-center gap-2 text-sm">
                <span className="capitalize">{item.source}</span>
                <span className="h-2 rounded-full bg-line"><span className="block h-2 rounded-full bg-brick" style={{ width: `${(item.count / maxSource) * 100}%` }} /></span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="display text-2xl">Where demand sits</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {byPlace.map(([place, count]) => (
              <li key={place} className="flex justify-between border-b border-line py-1"><span>{place}</span><span>{count}</span></li>
            ))}
          </ul>
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="display text-2xl">Most viewed</h2>
          <ul className="mt-3 text-sm">
            {products.map((product) => {
              const image = parseJson<string[]>(product.images, [])[0];
              return (
                <li key={product.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#e8eef8]">
                      <Cover src={image} alt="" />
                    </span>
                    <span className="truncate">{product.name}</span>
                  </span>
                  <span className="shrink-0 text-stone">{product.views} views · {product.enquiries} {product.enquiries === 1 ? "enquiry" : "enquiries"}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl">Unread alerts</h2>
            <Link href="/admin/leads" className="text-sm text-brick">Open leads</Link>
          </div>
          <ul className="mt-3 text-sm">
            {notifications.map((item) => (
              <li key={item.id} className="border-b border-line py-2">
                <p className="font-semibold">{item.title}</p>
                <p className="text-stone">{item.body}</p>
              </li>
            ))}
            {notifications.length === 0 ? <li className="text-stone">No unread alerts.</li> : null}
          </ul>
          <p className="mt-4 text-xs text-stone">{orders.length} order records in the pipeline.</p>
        </section>
      </div>
    </div>
  );
}
