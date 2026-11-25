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

export const metadata: Metadata = { title: "Your quotation" };

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await prisma.quote.findUnique({
    where: { publicToken: token },
    include: { lead: true, orders: { select: { id: true, number: true, paymentStatus: true, paymentMethod: true, paymentRef: true } } },
  });
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
  const linkedOrder = quote.orders[0] ?? null;
  const creditApproved = quote.lead?.creditStatus === "approved";
  const creditSuspended = quote.lead?.creditStatus === "suspended";
  const kindLabel = quote.kind === "formal" ? "Formal quotation" : "Provisional quotation";

  return (
    <div className="wrap py-12">
      <article className="mx-auto max-w-3xl rounded-[1.6rem] border border-line bg-card p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-brick">CBH {kindLabel.toLowerCase()}</p>
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
              <td className="py-3">Total {quote.kind === "formal" ? "" : "provisional estimate"}</td>
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

      {linkedOrder ? (
        <div className="mx-auto mt-6 max-w-3xl panel p-6">
          <h2 className="display text-3xl">Order {linkedOrder.number}</h2>
          <p className="mt-2 text-sm text-stone">
            Payment: <span className="capitalize">{linkedOrder.paymentStatus}</span>
            {linkedOrder.paymentMethod ? ` · ${linkedOrder.paymentMethod}` : ""}
            {linkedOrder.paymentRef ? ` · ref ${linkedOrder.paymentRef}` : ""}.
          </p>
          {linkedOrder.paymentStatus !== "paid" && site.bankDetails ? (
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-line bg-plaster p-4 text-sm text-ink">{site.bankDetails}</pre>
          ) : null}
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-3xl panel p-6">
          <h2 className="display text-3xl">Request order</h2>
          <p className="mt-2 text-sm text-stone">
            {creditSuspended
              ? "Credit on this account is suspended. Contact CBH sales."
              : "Choose how you will pay. Sales confirms before dispatch."}
          </p>
          {!creditSuspended ? (
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
                className="grid gap-3"
              >
                <input type="hidden" name="token" value={quote.publicToken} />
                <fieldset className="grid gap-2">
                  <legend className="label">Payment method</legend>
                  <label className="flex items-start gap-2 rounded-2xl border border-line bg-plaster p-3 text-sm">
                    <input type="radio" name="paymentMethod" value="bank" defaultChecked className="mt-1" />
                    <span>
                      <span className="font-semibold">Bank transfer</span>
                      <span className="mt-1 block text-stone">Pay with the reference we give you. Sales marks paid when funds clear.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 rounded-2xl border border-line bg-plaster p-3 text-sm">
                    <input type="radio" name="paymentMethod" value="arrange" className="mt-1" />
                    <span>
                      <span className="font-semibold">Arrange with sales</span>
                      <span className="mt-1 block text-stone">Cash, EcoCash, or another method agreed on WhatsApp.</span>
                    </span>
                  </label>
                  {creditApproved ? (
                    <label className="flex items-start gap-2 rounded-2xl border border-line bg-plaster p-3 text-sm">
                      <input type="radio" name="paymentMethod" value="credit" className="mt-1" />
                      <span>
                        <span className="font-semibold">Approved credit</span>
                        <span className="mt-1 block text-stone">
                          Use your account credit
                          {quote.lead?.creditLimit != null ? ` (limit ${money(quote.lead.creditLimit)})` : ""}.
                        </span>
                      </span>
                    </label>
                  ) : null}
                </fieldset>
                {site.bankDetails ? (
                  <div>
                    <p className="label">Bank details</p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-2xl border border-line bg-plaster p-4 text-sm text-ink">{site.bankDetails}</pre>
                  </div>
                ) : null}
                {site.paynowId ? (
                  <p className="text-sm text-stone">Paynow merchant ID on file: {site.paynowId}. Online gateway checkout can be wired when keys are live.</p>
                ) : null}
              </SmartForm>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
