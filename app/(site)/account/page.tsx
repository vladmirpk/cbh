import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, money } from "@/lib/format";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "customer") redirect("/admin");
  const leads = await prisma.lead.findMany({
    where: { email: session.email },
    include: { quotes: true, orders: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="bg-[#f6f8fc]">
      <div className="wrap py-12">
        <h1 className="text-4xl font-extrabold text-[#0c3c8c]">Hello, {session.name}</h1>
        <p className="mt-2 text-[#3d5a80]">Quotations and enquiries linked to {session.email}.</p>
        <div className="mt-8 grid gap-3">
          {leads.length === 0 ? <p className="rounded-2xl bg-white p-6">No quotations yet. <Link href="/quote" className="font-bold text-[#0c3c8c]">Get a quote</Link></p> : null}
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-2xl border border-[#e6eef8] bg-white p-5">
              <p className="font-bold text-[#0c3c8c]">{lead.productName} · {lead.status}</p>
              <p className="text-sm text-[#3d5a80]">{lead.location} · {formatDate(lead.createdAt)}</p>
              {lead.quotes.map((quote) => (
                <p key={quote.id} className="mt-2 text-sm"><Link href={`/q/${quote.publicToken}`} className="font-semibold text-[#0c3c8c]">{quote.number}</Link> · {money(quote.total)}</p>
              ))}
              {lead.orders.map((order) => <p key={order.id} className="text-sm">{order.number} · {order.status}</p>)}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
