import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads, canManageOrders } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { convertQuoteToOrder, updateQuote } from "@/lib/actions/admin";
import { formatDate, formatQty, money, waLink } from "@/lib/format";
import { quoteLinesFrom } from "@/lib/types";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { lead: true, orders: true, product: true },
  });
  if (!quote) notFound();
  const lines = quoteLinesFrom(quote);
  const linkedOrder = quote.orders[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-stone">Quotation · {formatDate(quote.createdAt)}</p>
        <h1 className="display mt-2 text-4xl">{quote.number}</h1>
        <p className="mt-2 text-sm text-stone">
          {quote.customerName} · {quote.location} · valid {quote.validDays} days
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="btn btn-ink" href={`/api/quotes/${quote.id}/pdf`}>Download PDF</Link>
          <Link className="btn btn-ghost" href={`/q/${quote.publicToken}`} target="_blank">Customer view</Link>
          {quote.leadId ? <Link className="btn btn-ghost" href={`/admin/leads/${quote.leadId}`}>Open lead</Link> : null}
          {linkedOrder ? <Link className="btn btn-ghost" href={`/admin/orders/${linkedOrder.id}`}>Order {linkedOrder.number}</Link> : null}
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-stone">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th>Qty</th>
                <th>Unit</th>
                <th className="pr-4 text-right">Line</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={`${line.sku}-${line.productName}`} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{line.productName}</p>
                    <p className="text-stone">{line.sku || "—"}</p>
                  </td>
                  <td>{formatQty(line.quantity)}</td>
                  <td>{money(line.unitPrice)} / {line.unit}</td>
                  <td className="pr-4 text-right">{money(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid gap-1 border-t border-line px-4 py-3 text-sm">
            <div className="flex justify-between"><span className="text-stone">Materials</span><span>{money(quote.productTotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{money(quote.deliveryCost)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{money(quote.total)}</span></div>
          </div>
        </div>

        <p className="mt-4 text-sm">
          <a href={waLink(quote.whatsapp || quote.phone, `Hello ${quote.customerName}, following up on quotation ${quote.number} for ${money(quote.total)}.`)}>WhatsApp customer</a>
        </p>
      </div>

      <div className="grid gap-4 content-start">
        <div className="panel p-4">
          <h2 className="display text-2xl">Edit quotation</h2>
          <div className="mt-3">
            <SmartForm action={updateQuote} submit="Save quotation" className="grid gap-3">
              <input type="hidden" name="id" value={quote.id} />
              <input type="hidden" name="items" value={quote.items ?? "[]"} />
              <label><span className="label">Customer</span><input className="field" name="customerName" defaultValue={quote.customerName} required /></label>
              <label><span className="label">Phone</span><input className="field" name="phone" defaultValue={quote.phone} required /></label>
              <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" defaultValue={quote.whatsapp ?? ""} /></label>
              <label><span className="label">Email</span><input className="field" name="email" defaultValue={quote.email ?? ""} /></label>
              <label><span className="label">Location</span><input className="field" name="location" defaultValue={quote.location} required /></label>
              <label><span className="label">Zone</span><input className="field" name="zoneName" defaultValue={quote.zoneName ?? ""} /></label>
              <label><span className="label">Headline product</span><input className="field" name="productName" defaultValue={quote.productName} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label><span className="label">Quantity</span><input className="field" name="quantity" defaultValue={quote.quantity} /></label>
                <label><span className="label">Unit</span><input className="field" name="unit" defaultValue={quote.unit} /></label>
              </div>
              <label><span className="label">Unit price</span><input className="field" name="unitPrice" defaultValue={quote.unitPrice} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label><span className="label">Materials total</span><input className="field" name="productTotal" defaultValue={quote.productTotal} required /></label>
                <label><span className="label">Delivery</span><input className="field" name="deliveryCost" defaultValue={quote.deliveryCost} required /></label>
              </div>
              <label><span className="label">Valid days</span><input className="field" name="validDays" defaultValue={quote.validDays} /></label>
              <label><span className="label">Disclaimer</span><textarea className="field min-h-20" name="disclaimer" defaultValue={quote.disclaimer} /></label>
            </SmartForm>
          </div>
        </div>

        {canManageOrders(user.role) && !linkedOrder ? (
          <form action={convertQuoteToOrder} className="panel p-4">
            <h2 className="display text-2xl">Convert to order</h2>
            <p className="mt-2 text-sm text-stone">Creates a confirmed order from this quotation so dispatch can intervene.</p>
            <input type="hidden" name="id" value={quote.id} />
            <label className="mt-3 block"><span className="label">Handover notes</span><input className="field" name="notes" placeholder="Payment terms, site access…" /></label>
            <button className="btn btn-primary mt-3" type="submit">Create order</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
