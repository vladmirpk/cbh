import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/roles";
import { quoteScope } from "@/lib/scope";
import { Denied } from "@/components/ui";
import { formatDate, money } from "@/lib/format";
import { deleteQuote } from "@/lib/actions/admin";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";

export default async function QuotesPage() {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const quotes = await prisma.quote.findMany({
    where: quoteScope({ id: user.id, role: user.role }),
    orderBy: { createdAt: "desc" },
    include: { lead: true, orders: { select: { id: true, number: true } } },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-ink">Quotations</h1>
          <p className="mt-2 text-sm text-stone">Preview, edit, or delete — deletes are blocked once an order exists.</p>
        </div>
        <Link href="/api/export/quotes" className="text-sm font-bold text-ink hover:underline">Download CSV</Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-stone">
            <tr>
              <th className="py-2">Quote</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Kind</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const hasOrder = quote.orders.length > 0;
              return (
                <tr key={quote.id} className="border-t border-line">
                  <td className="py-3">
                    <p className="font-semibold text-ink">{quote.number}</p>
                    <p className="text-stone">{formatDate(quote.createdAt)}</p>
                  </td>
                  <td>
                    {quote.customerName}
                    <p className="text-stone">{quote.location}</p>
                  </td>
                  <td>{money(quote.total)}</td>
                  <td className="capitalize">{quote.kind}</td>
                  <td>
                    {quote.orders[0] ? (
                      <Link href={`/admin/orders/${quote.orders[0].id}`}>{quote.orders[0].number}</Link>
                    ) : quote.lead ? (
                      <Link href={`/admin/leads/${quote.leadId}`}>{quote.lead.status}</Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <PreviewSheet
                        title={quote.number}
                        editHref={`/admin/quotes/${quote.id}`}
                        previewHref={`/q/${quote.publicToken}`}
                        lines={[
                          { label: "Customer", value: quote.customerName },
                          { label: "Total", value: money(quote.total) },
                          { label: "Kind", value: quote.kind },
                          { label: "Location", value: quote.location },
                          { label: "Created", value: formatDate(quote.createdAt) },
                        ]}
                      />
                      <RowActions
                        previewHref={`/q/${quote.publicToken}`}
                        previewLabel="Live"
                        previewExternal
                        editHref={`/admin/quotes/${quote.id}`}
                        deleteAction={hasOrder ? undefined : deleteQuote}
                        deleteFields={hasOrder ? undefined : { id: quote.id }}
                        deleteConfirm={
                          hasOrder
                            ? undefined
                            : {
                                title: `Delete ${quote.number}?`,
                                message: "This permanently removes the quotation from the desk. The public link will stop working.",
                                detail: `${quote.customerName} · ${money(quote.total)}`,
                                confirmLabel: "Delete quote",
                                cancelLabel: "Keep quote",
                                tone: "danger",
                              }
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
