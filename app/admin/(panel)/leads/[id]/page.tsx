import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads, canSeeAllLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { addNote, claimLead, updateLead, updateLeadContact } from "@/lib/actions/admin";
import { formatDate, formatQty, money, waLink } from "@/lib/format";
import { CREDIT_STATUSES, LEAD_SOURCES, LEAD_STATUSES } from "@/lib/types";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } }, quotes: true, assignedTo: true, orders: true },
  });
  if (!lead) notFound();
  if (!canSeeAllLeads(user.role) && lead.assignedToId && lead.assignedToId !== user.id) return <Denied />;
  const people = await prisma.user.findMany({
    where: { active: true, role: { in: ["salesperson", "management", "super_admin"] } },
    orderBy: { name: "asc" },
  });
  const phoneKey = lead.phone.replace(/\D/g, "") || lead.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-stone">{lead.source} · {formatDate(lead.createdAt)}</p>
        <h1 className="display mt-2 text-4xl">{lead.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="btn btn-ghost" href={`/admin/customers/${phoneKey}`}>Customer record</Link>
          <a className="btn btn-ghost" href={waLink(lead.whatsapp || lead.phone, `Hello ${lead.name}, this is CBH following up on ${lead.productName || "your enquiry"}.`)}>WhatsApp</a>
          <a className="btn btn-ghost" href={`tel:${lead.phone}`}>Call</a>
        </div>

        <div className="mt-6 panel p-4">
          <h2 className="display text-2xl">Contact details</h2>
          <div className="mt-3">
            <SmartForm action={updateLeadContact} submit="Save contact" className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={lead.id} />
              <label><span className="label">Name</span><input className="field" name="name" defaultValue={lead.name} required /></label>
              <label><span className="label">Phone</span><input className="field" name="phone" defaultValue={lead.phone} required /></label>
              <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" defaultValue={lead.whatsapp ?? ""} /></label>
              <label><span className="label">Email</span><input className="field" name="email" defaultValue={lead.email ?? ""} /></label>
              <label className="sm:col-span-2"><span className="label">Location</span><input className="field" name="location" defaultValue={lead.location} /></label>
              <label>
                <span className="label">Account type</span>
                <select className="field" name="customerType" defaultValue={lead.customerType}>
                  <option value="retail">Retail</option>
                  <option value="contractor">Contractor</option>
                </select>
              </label>
              <label><span className="label">Company</span><input className="field" name="company" defaultValue={lead.company ?? ""} /></label>
              <label><span className="label">Registration</span><input className="field" name="registration" defaultValue={lead.registration ?? ""} /></label>
              <label><span className="label">Monthly volume</span><input className="field" name="monthlyVolume" defaultValue={lead.monthlyVolume ?? ""} /></label>
              <label className="sm:col-span-2"><span className="label">Credit request</span><input className="field" name="creditRequest" defaultValue={lead.creditRequest ?? ""} /></label>
              <label>
                <span className="label">Credit status</span>
                <select className="field" name="creditStatus" defaultValue={lead.creditStatus || "none"}>
                  {CREDIT_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                </select>
              </label>
              <label><span className="label">Credit limit (US$)</span><input className="field" name="creditLimit" defaultValue={lead.creditLimit ?? ""} placeholder="e.g. 5000" /></label>
              <label><span className="label">Product interest</span><input className="field" name="productName" defaultValue={lead.productName ?? ""} /></label>
              <label><span className="label">Quantity</span><input className="field" name="quantity" defaultValue={lead.quantity ?? ""} /></label>
              <label><span className="label">Needed by</span><input className="field" name="requiredDate" defaultValue={lead.requiredDate ?? ""} /></label>
              <label>
                <span className="label">Source</span>
                <select className="field" name="source" defaultValue={lead.source}>
                  {LEAD_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="sm:col-span-2"><span className="label">Requirements</span><textarea className="field min-h-20" name="requirements" defaultValue={lead.requirements ?? ""} /></label>
            </SmartForm>
          </div>
        </div>

        <h2 className="mt-8 display text-2xl">Notes</h2>
        <ul className="mt-3 grid gap-2">
          {lead.notes.map((note) => (
            <li key={note.id} className="rounded-2xl border border-line bg-card p-3 text-sm">
              <p>{note.body}</p>
              <p className="mt-1 text-xs text-stone">{note.authorName} · {formatDate(note.createdAt)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <SmartForm action={addNote} submit="Add note">
            <input type="hidden" name="leadId" value={lead.id} />
            <textarea className="field min-h-24" name="body" placeholder="What was agreed?" />
          </SmartForm>
        </div>
      </div>

      <div className="grid gap-4">
        {!lead.assignedToId ? (
          <form action={claimLead} className="panel p-4">
            <input type="hidden" name="id" value={lead.id} />
            <button className="btn btn-ink">Claim this lead</button>
          </form>
        ) : null}
        <div className="panel p-4">
          <SmartForm action={updateLead} submit="Save pipeline">
            <input type="hidden" name="id" value={lead.id} />
            <label>
              <span className="label">Status</span>
              <select className="field" name="status" defaultValue={lead.status}>
                {LEAD_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
              </select>
            </label>
            {canSeeAllLeads(user.role) ? (
              <label>
                <span className="label">Salesperson</span>
                <select className="field" name="assignedToId" defaultValue={lead.assignedToId ?? ""}>
                  <option value="">Unassigned</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
              </label>
            ) : <input type="hidden" name="assignedToId" value={lead.assignedToId ?? ""} />}
            <label><span className="label">Follow-up date</span><input className="field" type="date" name="followUpDate" defaultValue={lead.followUpDate ?? ""} /></label>
            <label><span className="label">Quote value</span><input className="field" name="quoteValue" defaultValue={lead.quoteValue ?? ""} /></label>
          </SmartForm>
        </div>
        <div className="panel p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-stone">Credit</p>
          <p className="mt-1 capitalize font-semibold">
            {lead.creditStatus || "none"}
            {lead.creditLimit != null ? ` · ${money(lead.creditLimit)}` : ""}
          </p>
          {lead.creditRequest ? <p className="mt-1 text-stone">{lead.creditRequest}</p> : null}
        </div>
        <div className="panel p-4 text-sm">
          <h2 className="display text-2xl">Quotations & orders</h2>
          {lead.quotes.map((quote) => (
            <p key={quote.id} className="mt-2">
              <Link href={`/admin/quotes/${quote.id}`}>{quote.number}</Link> · {quote.kind} · {money(quote.total)}
            </p>
          ))}
          {lead.orders.map((order) => (
            <p key={order.id} className="mt-2">
              <Link href={`/admin/orders/${order.id}`}>{order.number}</Link> · {order.status}
            </p>
          ))}
          {!lead.quotes.length && !lead.orders.length ? <p className="mt-2 text-stone">No quotes or orders yet.</p> : null}
          {lead.productName ? (
            <p className="mt-3 text-stone">Interest: {lead.productName}{lead.quantity ? ` · ${formatQty(lead.quantity)}` : ""}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
