import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, money } from "@/lib/format";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "customer") redirect("/admin");

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  const phoneDigits = (user?.phone || "").replace(/\D/g, "");
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { email: session.email },
        ...(phoneDigits.length >= 7 ? [{ phone: { contains: phoneDigits.slice(-9) } }] : []),
      ],
    },
    include: { quotes: { orderBy: { createdAt: "desc" } }, orders: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const quotes = leads.flatMap((lead) => lead.quotes);
  const orders = leads.flatMap((lead) => lead.orders);
  const locations = [...new Set(leads.map((lead) => lead.location).filter(Boolean))];
  const creditLead = leads.find((lead) => lead.creditStatus && lead.creditStatus !== "none");

  return (
    <div className="bg-[#f6f8fc]">
      <div className="wrap py-12">
        <h1 className="text-4xl font-extrabold text-[#0c3c8c]">Hello, {session.name}</h1>
        <p className="mt-2 text-[#3d5a80]">Your quotes and orders.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/quote" className="btn btn-primary">New quote</Link>
          <Link href="/products" className="btn btn-ghost">Browse products</Link>
        </div>
        {creditLead ? (
          <p className="mt-4 rounded-2xl border border-[#e6eef8] bg-white px-4 py-3 text-sm text-[#10233f]">
            Credit: <span className="capitalize font-semibold">{creditLead.creditStatus}</span>
            {creditLead.creditLimit != null ? ` · limit ${money(creditLead.creditLimit)}` : ""}
          </p>
        ) : null}
        {locations.length ? (
          <div className="mt-6">
            <h2 className="text-lg font-extrabold text-ink">Saved delivery locations</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {locations.map((place) => (
                <li key={place} className="rounded-2xl border border-[#e6eef8] bg-white px-3 py-2 text-sm text-[#3d5a80]">{place}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <h2 className="mt-10 text-2xl font-extrabold text-ink">Quotations</h2>
        <div className="mt-3 grid gap-3">
          {!quotes.length ? <p className="rounded-2xl bg-white p-6 text-stone">No quotations yet.</p> : null}
          {quotes.map((quote) => (
            <article key={quote.id} className="rounded-2xl border border-[#e6eef8] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/q/${quote.publicToken}`} className="font-bold text-[#0c3c8c]">{quote.number}</Link>
                  <p className="text-sm text-[#3d5a80]">{quote.kind} · {formatDate(quote.createdAt)}</p>
                </div>
                <p className="font-semibold">{money(quote.total)}</p>
              </div>
              <p className="mt-2 text-sm">{quote.productName} · {quote.location}</p>
              <Link href={`/q/${quote.publicToken}`} className="mt-3 inline-block text-sm font-bold text-ink">Open / reorder →</Link>
            </article>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-extrabold text-ink">Orders</h2>
        <div className="mt-3 grid gap-3">
          {!orders.length ? <p className="rounded-2xl bg-white p-6 text-stone">No orders yet.</p> : null}
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[#e6eef8] bg-white p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-bold text-[#0c3c8c]">{order.number}</p>
                  <p className="text-sm text-[#3d5a80]">{order.status} · {order.paymentStatus} · {formatDate(order.createdAt)}</p>
                </div>
                <p className="font-semibold">{money(order.total)}</p>
              </div>
              <p className="mt-2 text-sm">{order.location}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
