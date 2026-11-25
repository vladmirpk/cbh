import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addDays, formatDate, formatQty, money, waLink } from "@/lib/format";
import { parseJson, quoteLinesFrom } from "@/lib/types";
import type { DeliveryBreakdown } from "@/lib/delivery";
import { getCommerce } from "@/lib/queries";
import { SmartForm } from "@/components/SmartForm";
import { Cover } from "@/components/site/Cover";
import { requestOrder } from "@/lib/actions/public";

export const metadata: Metadata = { title: "Your provisional quotation" };

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await prisma.quote.findUnique({ where: { publicToken: token } });
  if (!quote) notFound();
  const { site } = await getCommerce();
  const breakdown = parseJson<DeliveryBreakdown | null>(quote.breakdown, null);
  const lines = quoteLinesFrom(quote);
  const catalog = await prisma.product.findMany({
    where: { id: { in: lines.map((line) => line.productId).filter(Boolean) } },
    select: { id: true, images: true },
  });
  const imageById = new Map(
    catalog.map((product) => [product.id, parseJson<string[]>(product.images, [])[0] || null]),
  );
  const summary = lines
    .map((line) => `${formatQty(line.quantity)} ${line.unit} ${line.productName}`)
    .join(", ");
  const message = `Hello CBH, quote ${quote.number}: ${summary} to ${quote.location}. Please confirm.`;
  return (
    <div className="wrap py-12">
      <article className="mx-auto max-w-3xl rounded-[1.6rem] border border-line bg-card p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-brick">CBH provisional quotation</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="display text-4xl">{quote.number}</h1>
          <p className="text-sm text-stone">{formatDate(quote.createdAt)} · valid until {formatDate(addDays(quote.createdAt, quote.validDays))}</p>
        </div>
        <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-stone">Customer</dt><dd>{quote.customerName}</dd></div>
          <div><dt className="text-stone">Phone</dt><dd>{quote.phone}</dd></div>
          <div className="sm:col-span-2"><dt className="text-stone">Location</dt><dd>{quote.location}{quote.zoneName ? ` · ${quote.distanceKm} km` : ""}</dd></div>
        </dl>
        <table className="mt-8 w-full text-sm">
          <tbody>
            {lines.map((line) => (
              <tr key={`${line.productId}-${line.sku}`} className="border-t border-line">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#e8eef8]">
                      <Cover src={imageById.get(line.productId)} alt={line.productName} />
                    </div>
                    <span>
                      {line.productName}
                      <br />
                      <span className="text-stone">{formatQty(line.quantity)} {line.unit} @ {money(line.unitPrice)}</span>
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right align-middle">{money(line.lineTotal)}</td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="py-3">Estimated delivery{breakdown ? <span className="block text-stone">{breakdown.vehicle} · {breakdown.trips} trip{breakdown.trips === 1 ? "" : "s"}</span> : null}</td>
              <td className="py-3 text-right">{money(quote.deliveryCost)}</td>
            </tr>
            <tr className="border-t border-line text-base font-semibold">
              <td className="py-3">Total provisional estimate</td>
              <td className="py-3 text-right">{money(quote.total)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-6 text-sm leading-relaxed text-copper">{quote.disclaimer}</p>
        <p className="mt-4 text-sm text-stone">{site.address} · {site.phone} · {site.email}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link className="btn btn-ink" href={`/api/quotes/${quote.id}/pdf?token=${quote.publicToken}`}>Download PDF</Link>
          <a className="btn btn-primary" href={waLink(quote.whatsapp || site.whatsapp, message)} target="_blank" rel="noreferrer">Send on WhatsApp</a>
          <Link className="btn btn-ghost" href="/quote">New quote</Link>
        </div>
      </article>
      <div className="mx-auto mt-6 max-w-3xl panel p-6">
        <h2 className="display text-3xl">Request order</h2>
        <p className="mt-2 text-sm text-stone">Sales confirms payment.</p>
        <div className="mt-4">
          <SmartForm
            action={requestOrder}
            submit="Request order"
            confirm={{
              title: "Request order?",
              message: quote.number,
              confirmLabel: "Request order",
              cancelLabel: "Back",
            }}
          >
            <input type="hidden" name="token" value={quote.publicToken} />
          </SmartForm>
        </div>
      </div>
    </div>
  );
}
