import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { money } from "@/lib/format";

export default async function CustomersPage() {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const groups = new Map<string, typeof leads>();
  for (const lead of leads) {
    const key = lead.phone.replace(/\D/g, "") || lead.id;
    groups.set(key, [...(groups.get(key) ?? []), lead]);
  }
  return (
    <div>
      <h1 className="display text-4xl">Customers</h1>
      <p className="mt-2 text-sm text-stone">Built from enquiries. Accounts with a login are the next phase; the history is already here.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-stone"><tr><th className="py-2">Customer</th><th>Type</th><th>Enquiries</th><th>Latest value</th></tr></thead>
          <tbody>
            {[...groups.values()].map((items) => {
              const latest = items[0];
              return (
                <tr key={latest.id} className="border-t border-line">
                  <td className="py-3"><Link href={`/admin/leads/${latest.id}`} className="font-semibold">{latest.name}</Link><p className="text-stone">{latest.phone} · {latest.location}</p></td>
                  <td className="capitalize">{latest.customerType}{latest.company ? ` · ${latest.company}` : ""}</td>
                  <td>{items.length}</td>
                  <td>{latest.quoteValue != null ? money(latest.quoteValue) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
