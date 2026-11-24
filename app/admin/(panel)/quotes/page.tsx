import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { formatDate, money } from "@/lib/format";

export default async function QuotesPage() {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" }, include: { lead: true } });
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="display text-4xl">Quotations</h1><Link href="/api/export/quotes" className="text-sm">Download CSV</Link></div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-stone"><tr><th className="py-2">Quote</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-t border-line">
                <td className="py-3"><Link href={`/q/${quote.publicToken}`} className="font-semibold">{quote.number}</Link><p className="text-stone">{formatDate(quote.createdAt)}</p></td>
                <td>{quote.customerName}<p className="text-stone">{quote.location}</p></td>
                <td>{money(quote.total)}</td>
                <td>{quote.lead ? <Link href={`/admin/leads/${quote.leadId}`}>{quote.lead.status}</Link> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
