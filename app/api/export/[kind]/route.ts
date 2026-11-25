import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageLeads, canManageOrders, canManageProducts } from "@/lib/roles";
import { leadScope, orderScope, quoteScope } from "@/lib/scope";
import { csvCell } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorised", { status: 401 });
  const { kind } = await params;
  let rows: string[][] = [];
  if (kind === "leads") {
    if (!canManageLeads(session.role)) return new NextResponse("Forbidden", { status: 403 });
    const leads = await prisma.lead.findMany({
      where: leadScope({ id: session.sub, role: session.role }),
      orderBy: { createdAt: "desc" },
    });
    rows = [["Name", "Phone", "WhatsApp", "Email", "Location", "Type", "Credit", "Limit", "Product", "Quantity", "Value", "Status", "Source", "Created"],
      ...leads.map((lead) => [lead.name, lead.phone, lead.whatsapp ?? "", lead.email ?? "", lead.location, lead.customerType, lead.creditStatus, String(lead.creditLimit ?? ""), lead.productName ?? "", String(lead.quantity ?? ""), String(lead.quoteValue ?? ""), lead.status, lead.source, lead.createdAt.toISOString()])];
  } else if (kind === "quotes") {
    if (!canManageLeads(session.role)) return new NextResponse("Forbidden", { status: 403 });
    const quotes = await prisma.quote.findMany({
      where: quoteScope({ id: session.sub, role: session.role }),
      orderBy: { createdAt: "desc" },
    });
    rows = [["Number", "Kind", "Customer", "Phone", "Location", "Product", "Quantity", "Materials", "Delivery", "Total", "Date"],
      ...quotes.map((quote) => [quote.number, quote.kind, quote.customerName, quote.phone, quote.location, quote.productName, String(quote.quantity), String(quote.productTotal), String(quote.deliveryCost), String(quote.total), quote.createdAt.toISOString()])];
  } else if (kind === "products") {
    if (!canManageProducts(session.role)) return new NextResponse("Forbidden", { status: 403 });
    const products = await prisma.product.findMany({ include: { category: true } });
    rows = [["SKU", "Name", "Category", "Brand", "Price", "Unit", "Status", "MOQ", "Stock qty", "Weight kg"],
      ...products.map((product) => [product.sku, product.name, product.category.name, product.brand ?? "", String(product.price), product.unit, product.stockStatus, String(product.moq), String(product.stockQty ?? ""), String(product.weightKg)])];
  } else if (kind === "orders") {
    if (!canManageOrders(session.role)) return new NextResponse("Forbidden", { status: 403 });
    const orders = await prisma.order.findMany({
      where: orderScope({ id: session.sub, role: session.role }),
      orderBy: { createdAt: "desc" },
    });
    rows = [["Number", "Customer", "Phone", "Location", "Total", "Status", "Payment", "Method", "Date"],
      ...orders.map((order) => [order.number, order.customerName, order.phone, order.location, String(order.total), order.status, order.paymentStatus, order.paymentMethod ?? "", order.createdAt.toISOString()])];
  } else {
    return new NextResponse("Unknown export", { status: 404 });
  }
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cbh-${kind}.csv"`,
    },
  });
}
