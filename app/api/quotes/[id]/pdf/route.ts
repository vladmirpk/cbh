import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildQuotePdf } from "@/lib/pdf";
import { parseJson } from "@/lib/types";
import type { DeliveryBreakdown } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const quote = await prisma.quote.findUnique({ where: { id } });
  const session = await getSession();
  if (!quote) return new NextResponse("Not found", { status: 404 });
  if (quote.publicToken !== token && !session) return new NextResponse("Unauthorised", { status: 401 });
  const site = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!site) return new NextResponse("Settings missing", { status: 500 });
  const bytes = await buildQuotePdf(
    {
      ...quote,
      breakdown: parseJson<DeliveryBreakdown>(quote.breakdown, {
        distanceKm: quote.distanceKm,
        weightKg: 0,
        trips: 1,
        vehicle: "Delivery",
        baseCharge: 0,
        distanceCharge: 0,
        minApplied: false,
        vehicleSurcharge: 0,
        extraCharge: 0,
        fuelAmount: 0,
        deliveryCost: quote.deliveryCost,
      }),
    },
    site,
  );
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.number}.pdf"`,
    },
  });
}
