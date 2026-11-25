import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { updateLeadContact } from "@/lib/actions/admin";
import { formatDate, money } from "@/lib/format";
import { CREDIT_STATUSES, LEAD_SOURCES } from "@/lib/types";

export default async function CustomerRecordPage({ params }: { params: Promise<{ key: string }> }) {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const { key } = await params;
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quotes: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, take: 8 },
      assignedTo: true,
    },
  });
  const matches = leads.filter((lead) => (lead.phone.replace(/\D/g, "") || lead.id) === key);
  if (!matches.length) notFound();
  const primary = matches[0];
  const quoteTotal = matches.flatMap((lead) => lead.quotes).reduce((sum, quote) => sum + quote.total, 0);
  const orderTotal = matches.flatMap((lead) => lead.orders).reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-stone">Customer record</p>
        <h1 className="display mt-2 text-4xl">{primary.name}</h1>
        <p className="mt-2 text-sm text-stone">
          {primary.phone} · {primary.location} · {matches.length} enquir{matches.length === 1 ? "y" : "ies"}
        </p>
        <dl className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-stone">Account</dt><dd className="capitalize font-semibold">{primary.customerType}{primary.company ? ` · ${primary.company}` : ""}</dd></div>
          <div><dt className="text-stone">Credit</dt><dd className="font-semibold capitalize">{primary.creditStatus}{primary.creditLimit != null ? ` · ${money(primary.creditLimit)}` : ""}</dd></div>
          <div><dt className="text-stone">Quoted</dt><dd className="font-semibold">{money(quoteTotal)}</dd></div>
          <div><dt className="text-stone">Ordered</dt><dd className="font-semibold">{money(orderTotal)}</dd></div>
        </dl>

        <h2 className="mt-8 display text-2xl">Enquiry history</h2>
        <ul className="mt-3 grid gap-3">
          {matches.map((lead) => (
            <li key={lead.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/admin/leads/${lead.id}`} className="font-semibold">{lead.productName || "General enquiry"}</Link>
                  <p className="text-stone">{formatDate(lead.createdAt)} · {lead.status} · {lead.source}</p>
                </div>
                <p>{lead.quoteValue != null ? money(lead.quoteValue) : "—"}</p>
              </div>
              {lead.quotes.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {lead.quotes.map((quote) => (
                    <Link key={quote.id} className="btn btn-ghost" href={`/admin/quotes/${quote.id}`}>{quote.number}</Link>
                  ))}
                </div>
              ) : null}
              {lead.orders.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {lead.orders.map((order) => (
                    <Link key={order.id} className="btn btn-ghost" href={`/admin/orders/${order.id}`}>{order.number}</Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <h2 className="mt-8 display text-2xl">Recent notes</h2>
        <ul className="mt-3 grid gap-2">
          {matches.flatMap((lead) => lead.notes).slice(0, 10).map((note) => (
            <li key={note.id} className="rounded-2xl border border-line bg-card p-3 text-sm">
              <p>{note.body}</p>
              <p className="mt-1 text-xs text-stone">{note.authorName} · {formatDate(note.createdAt)}</p>
            </li>
          ))}
          {!matches.some((lead) => lead.notes.length) ? <li className="text-sm text-stone">No notes yet.</li> : null}
        </ul>
      </div>

      <div className="panel p-4 h-fit">
        <h2 className="display text-2xl">Edit primary contact</h2>
        <p className="mt-2 text-sm text-stone">Updates the latest enquiry for this phone number.</p>
        <div className="mt-3">
          <SmartForm action={updateLeadContact} submit="Save customer" className="grid gap-3">
            <input type="hidden" name="id" value={primary.id} />
            <label><span className="label">Name</span><input className="field" name="name" defaultValue={primary.name} required /></label>
            <label><span className="label">Phone</span><input className="field" name="phone" defaultValue={primary.phone} required /></label>
            <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" defaultValue={primary.whatsapp ?? ""} /></label>
            <label><span className="label">Email</span><input className="field" name="email" defaultValue={primary.email ?? ""} /></label>
            <label><span className="label">Location</span><input className="field" name="location" defaultValue={primary.location} /></label>
            <label>
              <span className="label">Account type</span>
              <select className="field" name="customerType" defaultValue={primary.customerType}>
                <option value="retail">Retail</option>
                <option value="contractor">Contractor</option>
              </select>
            </label>
            <label><span className="label">Company</span><input className="field" name="company" defaultValue={primary.company ?? ""} /></label>
            <label><span className="label">Registration</span><input className="field" name="registration" defaultValue={primary.registration ?? ""} /></label>
            <label><span className="label">Monthly volume</span><input className="field" name="monthlyVolume" defaultValue={primary.monthlyVolume ?? ""} /></label>
            <label><span className="label">Credit request</span><input className="field" name="creditRequest" defaultValue={primary.creditRequest ?? ""} /></label>
            <label>
              <span className="label">Credit status</span>
              <select className="field" name="creditStatus" defaultValue={primary.creditStatus || "none"}>
                {CREDIT_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
              </select>
            </label>
            <label><span className="label">Credit limit (US$)</span><input className="field" name="creditLimit" defaultValue={primary.creditLimit ?? ""} /></label>
            <label><span className="label">Product interest</span><input className="field" name="productName" defaultValue={primary.productName ?? ""} /></label>
            <label><span className="label">Quantity</span><input className="field" name="quantity" defaultValue={primary.quantity ?? ""} /></label>
            <label>
              <span className="label">Source</span>
              <select className="field" name="source" defaultValue={primary.source}>
                {LEAD_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </label>
            <label><span className="label">Requirements</span><textarea className="field min-h-20" name="requirements" defaultValue={primary.requirements ?? ""} /></label>
          </SmartForm>
        </div>
      </div>
    </div>
  );
}
