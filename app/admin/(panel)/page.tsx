import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canSeeAllLeads, canSeeFinance } from "@/lib/roles";
import { leadScope, orderScope, quoteScope } from "@/lib/scope";
import { formatDate, money } from "@/lib/format";
import { LEAD_SOURCES, parseJson } from "@/lib/types";
import { Cover } from "@/components/site/Cover";

export default async function DashboardPage() {
  const user = await requireUser();
  const finance = canSeeFinance(user.role);
  const management = canSeeAllLeads(user.role);
  const scopeUser = { id: user.id, role: user.role };
  const today = new Date().toISOString().slice(0, 10);

  const [leads, quotes, orders, products, notifications, promotions, salespeople] = await Promise.all([
    prisma.lead.findMany({ where: leadScope(scopeUser), include: { assignedTo: true } }),
    prisma.quote.findMany({ where: quoteScope(scopeUser) }),
    prisma.order.findMany({ where: orderScope(scopeUser) }),
    prisma.product.findMany({ where: { active: true }, orderBy: { views: "desc" }, take: 5 }),
    prisma.notification.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.promotion.findMany({ where: { active: true } }),
    management
      ? prisma.user.findMany({ where: { role: "salesperson", active: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  const won = leads.filter((lead) => lead.status === "won").length;
  const lost = leads.filter((lead) => lead.status === "lost").length;
  const followUps = leads
    .filter((lead) => lead.followUpDate && lead.followUpDate <= today && !["won", "lost"].includes(lead.status))
    .sort((a, b) => (a.followUpDate || "").localeCompare(b.followUpDate || ""));
  const openQuotes = quotes.filter((quote) => {
    const lead = leads.find((item) => item.id === quote.leadId);
    return lead ? lead.status !== "lost" : true;
  });
  const quoteValue = openQuotes.reduce((sum, quote) => sum + quote.total, 0);
  const bySource = LEAD_SOURCES.map((source) => ({
    source,
    count: leads.filter((lead) => lead.source === source).length,
  })).filter((item) => item.count > 0);
  const maxSource = Math.max(1, ...bySource.map((item) => item.count));
  const byPlace = Object.entries(
    leads.reduce<Record<string, number>>((map, lead) => {
      const key = lead.location.split(",")[0] || "Unknown";
      map[key] = (map[key] ?? 0) + 1;
      return map;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const promoPerf = promotions.map((promo) => {
    const slugHint = promo.slug;
    const linked = leads.filter(
      (lead) =>
        lead.source === "advertisement" &&
        (`${lead.requirements || ""} ${lead.productName || ""}`.toLowerCase().includes(slugHint) ||
          (promo.targetArea && lead.location.toLowerCase().includes(promo.targetArea.toLowerCase()))),
    ).length;
    return { title: promo.title, audience: promo.audience, linked, active: promo.active };
  });

  const repRows = salespeople.map((person) => {
    const theirs = leads.filter((lead) => lead.assignedToId === person.id);
    const theirWon = theirs.filter((lead) => lead.status === "won").length;
    const theirLost = theirs.filter((lead) => lead.status === "lost").length;
    const value = theirs.reduce((sum, lead) => sum + (lead.quoteValue || 0), 0);
    return { name: person.name, total: theirs.length, won: theirWon, lost: theirLost, value };
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="display text-4xl">Today on the desk</h1>
        <p className="mt-2 text-sm text-stone">
          {management ? "All leads and team performance." : "Your assigned and unassigned leads."}
          {" "}GA sessions need NEXT_PUBLIC_GA_ID.
        </p>
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

      <section className="panel p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="display text-2xl">Follow-ups due</h2>
          <Link href="/admin/leads" className="text-sm text-brick">Open leads</Link>
        </div>
        <ul className="mt-3 grid gap-2 text-sm">
          {followUps.slice(0, 8).map((lead) => (
            <li key={lead.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2">
              <Link href={`/admin/leads/${lead.id}`} className="font-semibold">{lead.name}</Link>
              <span className="text-stone">{lead.followUpDate} · {lead.status}</span>
            </li>
          ))}
          {!followUps.length ? <li className="text-stone">Nothing due.</li> : null}
        </ul>
      </section>

      {management && repRows.length ? (
        <section className="panel p-5">
          <h2 className="display text-2xl">Salesperson performance</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-stone">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Leads</th>
                  <th>Won</th>
                  <th>Lost</th>
                  <th>Quote value</th>
                </tr>
              </thead>
              <tbody>
                {repRows.map((row) => (
                  <tr key={row.name} className="border-t border-line">
                    <td className="py-2 font-semibold">{row.name}</td>
                    <td>{row.total}</td>
                    <td>{row.won}</td>
                    <td>{row.lost}</td>
                    <td>{finance ? money(row.value) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-stone">Unassigned pool: {leads.filter((l) => !l.assignedToId).length} · Closed lost overall: {lost}</p>
        </section>
      ) : null}

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
                  <span className="shrink-0 text-stone">{product.views} views · {product.enquiries} enquiries</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="panel p-5">
          <h2 className="display text-2xl">Campaign signals</h2>
          <ul className="mt-3 text-sm">
            {promoPerf.slice(0, 6).map((item) => (
              <li key={item.title} className="flex justify-between gap-2 border-b border-line py-2">
                <span>
                  <span className="font-semibold">{item.title}</span>
                  {item.audience ? <span className="block text-xs text-stone">{item.audience}</span> : null}
                </span>
                <span className="text-stone">{item.linked} matched leads</span>
              </li>
            ))}
            {!promoPerf.length ? <li className="text-stone">No active promotions.</li> : null}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-stone">{orders.length} orders in your scope · {formatDate(new Date())}</p>
            <Link href="/admin/notifications" className="text-sm text-brick">{notifications.length} alerts</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
