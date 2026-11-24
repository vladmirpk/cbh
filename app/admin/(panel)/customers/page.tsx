import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { money } from "@/lib/format";

export default async function CustomersPage() {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { quotes: true, orders: true },
  });
  const groups = new Map<string, typeof leads>();
  for (const lead of leads) {
    const key = lead.phone.replace(/\D/g, "") || lead.id;
    groups.set(key, [...(groups.get(key) ?? []), lead]);
  }
  return (
    <div>
      <h1 className="display text-4xl">Customers</h1>
      <p className="mt-2 text-sm text-stone">Grouped by phone. Open a record to edit contact details and review every enquiry, quote and order.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-stone">
            <tr>
              <th className="py-2">Customer</th>
              <th>Type</th>
              <th>Enquiries</th>
              <th>Quoted</th>
              <th>Ordered</th>
            </tr>
          </thead>
          <tbody>
            {[...groups.entries()].map(([key, items]) => {
              const latest = items[0];
              const quoted = items.flatMap((item) => item.quotes).reduce((sum, quote) => sum + quote.total, 0);
              const ordered = items.flatMap((item) => item.orders).reduce((sum, order) => sum + order.total, 0);
              return (
                <tr key={key} className="border-t border-line">
                  <td className="py-3">
                    <Link href={`/admin/customers/${key}`} className="font-semibold">{latest.name}</Link>
                    <p className="text-stone">{latest.phone} · {latest.location}</p>
                  </td>
                  <td className="capitalize">{latest.customerType}{latest.company ? ` · ${latest.company}` : ""}</td>
                  <td>{items.length}</td>
                  <td>{quoted ? money(quoted) : "—"}</td>
                  <td>{ordered ? money(ordered) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
