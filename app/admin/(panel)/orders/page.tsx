import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageOrders } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { formatDate, money } from "@/lib/format";

export default async function OrdersPage() {
  const user = await requireUser();
  if (!canManageOrders(user.role)) return <Denied />;
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">Orders</h1>
        <Link className="text-sm" href="/api/export/orders">Download CSV</Link>
      </div>
      <p className="mt-2 text-sm text-stone">
        Requested → confirmed → loading → dispatched → in transit → delivered. Open an order to print, edit totals or intervene on fleet and payment.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-stone">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold">{order.number}</Link>
                  <p className="text-stone">{formatDate(order.createdAt)}</p>
                </td>
                <td>
                  {order.customerName}
                  <p className="text-stone">{order.location}</p>
                </td>
                <td>{money(order.total)}</td>
                <td className="capitalize">{order.status.replace(/_/g, " ")}</td>
                <td className="capitalize">{order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
