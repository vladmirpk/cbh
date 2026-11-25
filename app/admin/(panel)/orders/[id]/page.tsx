import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageOrders } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { confirmOrderPayment, updateOrderRecord } from "@/lib/actions/admin";
import { formatDate, formatQty, money, waLink } from "@/lib/format";
import { ORDER_STATUSES, parseJson } from "@/lib/types";

type OrderLine = {
  productName?: string;
  product?: string;
  sku?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  lineTotal?: number;
  total?: number;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!canManageOrders(user.role)) return <Denied />;
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { lead: true, quote: true },
  });
  if (!order) notFound();
  const lines = parseJson<OrderLine[]>(order.items, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-stone">Order · {formatDate(order.createdAt)}</p>
        <h1 className="display mt-2 text-4xl">{order.number}</h1>
        <p className="mt-2 text-sm text-stone">
          {order.customerName} · {order.location} · {order.status.replace(/_/g, " ")} · {order.paymentStatus}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="btn btn-ink" href={`/api/orders/${order.id}/pdf`}>Download / print</Link>
          {order.quoteId ? <Link className="btn btn-ghost" href={`/admin/quotes/${order.quoteId}`}>Source quote</Link> : null}
          {order.leadId ? <Link className="btn btn-ghost" href={`/admin/leads/${order.leadId}`}>Open lead</Link> : null}
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-left text-stone">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th>Qty</th>
                <th className="pr-4 text-right">Line</th>
              </tr>
            </thead>
            <tbody>
              {lines.length ? lines.map((line, index) => {
                const label = line.productName || line.product || "Item";
                const amount = line.lineTotal ?? line.total;
                return (
                  <tr key={`${label}-${index}`} className="border-t border-line">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{label}</p>
                      {line.sku ? <p className="text-stone">{line.sku}</p> : null}
                    </td>
                    <td>{line.quantity != null ? `${formatQty(line.quantity)}${line.unit ? ` ${line.unit}` : ""}` : "—"}</td>
                    <td className="pr-4 text-right">{amount != null ? money(amount) : "—"}</td>
                  </tr>
                );
              }) : (
                <tr className="border-t border-line">
                  <td className="px-4 py-3" colSpan={3}>No line items stored on this order.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between border-t border-line px-4 py-3 text-sm font-semibold">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </div>
        </div>

        <p className="mt-4 text-sm">
          <a href={waLink(order.phone, `Hello ${order.customerName}, update on order ${order.number}.`)}>WhatsApp customer</a>
        </p>
      </div>

      <div className="panel p-4">
        <h2 className="display text-2xl">Payment</h2>
        <div className="mt-3">
          <SmartForm action={confirmOrderPayment} submit="Save payment" className="grid gap-3">
            <input type="hidden" name="id" value={order.id} />
            <label><span className="label">Payment status</span>
              <select className="field" name="paymentStatus" defaultValue={order.paymentStatus}>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <label><span className="label">Method</span><input className="field" name="paymentMethod" defaultValue={order.paymentMethod ?? ""} placeholder="bank / credit / cash" /></label>
            <label><span className="label">Reference</span><input className="field" name="paymentRef" defaultValue={order.paymentRef ?? ""} /></label>
          </SmartForm>
        </div>
      </div>
      <div className="panel p-4">
        <h2 className="display text-2xl">Intervene</h2>
        <p className="mt-2 text-sm text-stone">Change status, payment, fleet, totals or notes without leaving the desk.</p>
        <div className="mt-3">
          <SmartForm action={updateOrderRecord} submit="Save order" className="grid gap-3">
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="items" value={order.items} />
            <label><span className="label">Status</span>
              <select className="field" name="status" defaultValue={order.status}>
                {ORDER_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
              </select>
            </label>
            <label><span className="label">Payment</span>
              <select className="field" name="paymentStatus" defaultValue={order.paymentStatus}>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <label><span className="label">Customer</span><input className="field" name="customerName" defaultValue={order.customerName} required /></label>
            <label><span className="label">Phone</span><input className="field" name="phone" defaultValue={order.phone} required /></label>
            <label><span className="label">Email</span><input className="field" name="email" defaultValue={order.email ?? ""} /></label>
            <label><span className="label">Location</span><input className="field" name="location" defaultValue={order.location} required /></label>
            <label><span className="label">Total</span><input className="field" name="total" defaultValue={order.total} required /></label>
            <label><span className="label">Vehicle</span><input className="field" name="vehicle" defaultValue={order.vehicle ?? ""} /></label>
            <label><span className="label">Driver</span><input className="field" name="driver" defaultValue={order.driver ?? ""} /></label>
            <label><span className="label">Delivery date</span><input className="field" type="date" name="deliveryDate" defaultValue={order.deliveryDate ?? ""} /></label>
            <label><span className="label">Notes</span><textarea className="field min-h-20" name="notes" defaultValue={order.notes ?? ""} /></label>
          </SmartForm>
        </div>
      </div>
    </div>
  );
}
