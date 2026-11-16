import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageOrders } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { updateOrder } from "@/lib/actions/admin";
import { money } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";

export default async function OrdersPage() {
  const user = await requireUser();
  if (!canManageOrders(user.role)) return <Denied />;
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="display text-4xl">Orders</h1><a className="text-sm" href="/api/export/orders">Download CSV</a></div>
      <p className="mt-2 text-sm text-stone">Requested → confirmed → loading → dispatched → in transit → delivered. Online payment stays unpaid until a gateway is connected.</p>
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="panel p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">{order.number} · {order.customerName}</p>
                <p className="text-sm text-stone">{order.location} · {money(order.total)}</p>
              </div>
            </div>
            <div className="mt-3">
              <SmartForm action={updateOrder} submit="Update order" className="grid gap-3 md:grid-cols-3">
                <input type="hidden" name="id" value={order.id} />
                <label><span className="label">Status</span><select className="field" name="status" defaultValue={order.status}>{ORDER_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label>
                <label><span className="label">Payment</span><select className="field" name="paymentStatus" defaultValue={order.paymentStatus}><option value="unpaid">Unpaid</option><option value="pending">Pending</option><option value="paid">Paid</option></select></label>
                <label><span className="label">Vehicle</span><input className="field" name="vehicle" defaultValue={order.vehicle ?? ""} /></label>
                <label><span className="label">Driver</span><input className="field" name="driver" defaultValue={order.driver ?? ""} /></label>
                <label><span className="label">Delivery date</span><input className="field" type="date" name="deliveryDate" defaultValue={order.deliveryDate ?? ""} /></label>
                <label className="md:col-span-3"><span className="label">Notes</span><input className="field" name="notes" defaultValue={order.notes ?? ""} /></label>
              </SmartForm>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
