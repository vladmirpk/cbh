import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads, canSeeAllLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { claimLead, updateLeadContact } from "@/lib/actions/admin";
import { LeadActivity } from "@/components/admin/LeadActivity";
import { LeadNoteForm } from "@/components/admin/LeadNoteForm";
import { LeadPipelinePanel } from "@/components/admin/LeadPipelinePanel";
import { formatDate, formatQty, money, waLink } from "@/lib/format";
import { CREDIT_STATUSES, LEAD_SOURCES, leadStatusLabel, stageReasonLabel } from "@/lib/types";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" }, take: 80 },
      quotes: true,
      assignedTo: true,
      orders: true,
    },
  });
  if (!lead) notFound();
  if (!canSeeAllLeads(user.role) && lead.assignedToId && lead.assignedToId !== user.id) return <Denied />;
  const people = await prisma.user.findMany({
    where: { active: true, role: { in: ["salesperson", "management", "super_admin"] } },
    orderBy: { name: "asc" },
  });
  const phoneKey = lead.phone.replace(/\D/g, "") || lead.id;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
            {lead.source} · {formatDate(lead.createdAt)} · {leadStatusLabel(lead.status)}
          </p>
          <h1 className="display mt-2 text-4xl text-ink">{lead.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone">
            {lead.assignedTo ? <span>Owner: {lead.assignedTo.name}</span> : <span>Unassigned</span>}
            {lead.stageReason ? <span>{stageReasonLabel(lead.stageReason)}</span> : null}
            {lead.nextAction ? <span className="font-semibold text-ink">Next: {lead.nextAction}</span> : null}
            {lead.followUpDate ? <span className="font-bold text-[#8a6a00]">Follow up {lead.followUpDate}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn btn-ghost" href="/admin/leads">Back to board</Link>
            <Link className="btn btn-ghost" href={`/admin/customers/${phoneKey}`}>Customer record</Link>
            <a className="btn btn-ghost" href={waLink(lead.whatsapp || lead.phone, `Hello ${lead.name}, this is CBH following up on ${lead.productName || "your enquiry"}.`)}>WhatsApp</a>
            <a className="btn btn-ghost" href={`tel:${lead.phone}`}>Call</a>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_.85fr]">
        <div className="grid gap-6">
          <div className="panel p-4">
            <h2 className="display text-2xl text-ink">Contact & opportunity</h2>
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
                <label className="sm:col-span-2"><span className="label">Requirements / changes wanted</span><textarea className="field min-h-20" name="requirements" defaultValue={lead.requirements ?? ""} /></label>
              </SmartForm>
            </div>
          </div>

          <LeadActivity events={lead.events} notes={lead.notes} />
          <LeadNoteForm leadId={lead.id} />
        </div>

        <div className="grid gap-4 self-start">
          {!lead.assignedToId ? (
            <form action={claimLead} className="panel p-4">
              <input type="hidden" name="id" value={lead.id} />
              <p className="text-sm text-stone">Nobody owns this lead yet.</p>
              <button className="btn btn-ink mt-3">Claim this lead</button>
            </form>
          ) : null}

          <LeadPipelinePanel
            lead={{
              id: lead.id,
              status: lead.status,
              assignedToId: lead.assignedToId,
              followUpDate: lead.followUpDate,
              nextAction: lead.nextAction,
              stageReason: lead.stageReason,
              quoteValue: lead.quoteValue,
            }}
            people={people}
            canAssign={canSeeAllLeads(user.role)}
          />

          <div className="panel p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone">Credit</p>
            <p className="mt-1 capitalize font-semibold text-ink">
              {lead.creditStatus || "none"}
              {lead.creditLimit != null ? ` · ${money(lead.creditLimit)}` : ""}
            </p>
            {lead.creditRequest ? <p className="mt-1 text-stone">{lead.creditRequest}</p> : null}
          </div>

          <div className="panel p-4 text-sm">
            <h2 className="display text-2xl text-ink">Quotations & orders</h2>
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
    </div>
  );
}
