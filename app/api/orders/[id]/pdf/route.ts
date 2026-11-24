import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildOrderPdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorised", { status: 401 });
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return new NextResponse("Not found", { status: 404 });
  const site = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!site) return new NextResponse("Settings missing", { status: 500 });
  const bytes = await buildOrderPdf(order, site);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.number}.pdf"`,
    },
  });
}
