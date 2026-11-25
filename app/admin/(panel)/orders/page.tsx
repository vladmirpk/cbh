import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageOrders } from "@/lib/roles";
import { orderScope } from "@/lib/scope";
import { Denied } from "@/components/ui";
import { formatDate, money } from "@/lib/format";
import { cancelOrder } from "@/lib/actions/admin";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";

export default async function OrdersPage() {
  const user = await requireUser();
  if (!canManageOrders(user.role)) return <Denied />;
  const orders = await prisma.order.findMany({
    where: orderScope({ id: user.id, role: user.role }),
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-ink">Orders</h1>
          <p className="mt-2 text-sm text-stone">Preview, edit, or cancel — cancellations need confirmation.</p>
        </div>
        <Link className="text-sm font-bold text-ink hover:underline" href="/api/export/orders">Download CSV</Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-stone">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const cancelled = order.status === "cancelled";
              return (
                <tr key={order.id} className="border-t border-line">
                  <td className="py-3">
                    <p className="font-semibold text-ink">{order.number}</p>
                    <p className="text-stone">{formatDate(order.createdAt)}</p>
                  </td>
                  <td>
                    {order.customerName}
                    <p className="text-stone">{order.location}</p>
                  </td>
                  <td>{money(order.total)}</td>
                  <td className="capitalize">{order.status.replace(/_/g, " ")}</td>
                  <td className="capitalize">{order.paymentStatus}{order.paymentMethod ? ` · ${order.paymentMethod}` : ""}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <PreviewSheet
                        title={order.number}
                        editHref={`/admin/orders/${order.id}`}
                        lines={[
                          { label: "Customer", value: order.customerName },
                          { label: "Total", value: money(order.total) },
                          { label: "Status", value: order.status.replace(/_/g, " ") },
                          { label: "Payment", value: `${order.paymentStatus}${order.paymentMethod ? ` · ${order.paymentMethod}` : ""}` },
                          { label: "Location", value: order.location },
                        ]}
                      />
                      <RowActions
                        editHref={`/admin/orders/${order.id}`}
                        deleteAction={cancelled ? undefined : cancelOrder}
                        deleteFields={cancelled ? undefined : { id: order.id }}
                        deleteLabel="Cancel"
                        deleteConfirm={
                          cancelled
                            ? undefined
                            : {
                                title: `Cancel ${order.number}?`,
                                message: "The order will be marked cancelled. Linked leads may move to Lost.",
                                detail: `${order.customerName} · ${money(order.total)}`,
                                confirmLabel: "Cancel order",
                                cancelLabel: "Keep order",
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
