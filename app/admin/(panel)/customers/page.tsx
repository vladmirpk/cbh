import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads, canSeeAllLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { money } from "@/lib/format";
import { deleteCustomer } from "@/lib/actions/admin";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";

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
  const canDelete = canSeeAllLeads(user.role);

  return (
    <div>
      <h1 className="display text-4xl text-ink">Customers</h1>
      <p className="mt-2 text-sm text-stone">
        Grouped by phone. Preview, edit, or remove a customer record — deletes ask for confirmation first.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left text-stone">
            <tr>
              <th className="py-2">Customer</th>
              <th>Type</th>
              <th>Enquiries</th>
              <th>Quoted</th>
              <th>Ordered</th>
              <th className="text-right">Actions</th>
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
                    <p className="font-semibold text-ink">{latest.name}</p>
                    <p className="text-stone">{latest.phone} · {latest.location}</p>
                  </td>
                  <td className="capitalize">{latest.customerType}{latest.company ? ` · ${latest.company}` : ""}</td>
                  <td>{items.length}</td>
                  <td>{quoted ? money(quoted) : "—"}</td>
                  <td>{ordered ? money(ordered) : "—"}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <PreviewSheet
                        title={latest.name}
                        editHref={`/admin/customers/${key}`}
                        lines={[
                          { label: "Phone", value: latest.phone },
                          { label: "Location", value: latest.location },
                          { label: "Type", value: `${latest.customerType}${latest.company ? ` · ${latest.company}` : ""}` },
                          { label: "Enquiries", value: String(items.length) },
                          { label: "Quoted", value: quoted ? money(quoted) : "—" },
                          { label: "Ordered", value: ordered ? money(ordered) : "—" },
                        ]}
                      />
                      <RowActions
                        editHref={`/admin/customers/${key}`}
                        deleteAction={canDelete ? deleteCustomer : undefined}
                        deleteFields={canDelete ? { key } : undefined}
                        deleteLabel="Delete"
                        deleteConfirm={
                          canDelete
                            ? {
                                title: `Delete ${latest.name}?`,
                                message:
                                  "This removes every enquiry for this phone from the CRM. Linked quotes and orders stay, but are detached from the customer.",
                                detail: `${latest.phone} · ${items.length} enquir${items.length === 1 ? "y" : "ies"}`,
                                confirmLabel: "Delete customer",
                                cancelLabel: "Keep customer",
                                tone: "danger",
                              }
                            : undefined
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
