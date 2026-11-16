import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads, canSeeAllLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { addNote, claimLead, updateLead } from "@/lib/actions/admin";
import { formatDate, formatQty, money, waLink } from "@/lib/format";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/types";

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
  const people = await prisma.user.findMany({ where: { active: true, role: { in: ["salesperson", "management", "super_admin"] } }, orderBy: { name: "asc" } });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-stone">{lead.source} · {formatDate(lead.createdAt)}</p>
        <h1 className="display mt-2 text-4xl">{lead.name}</h1>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-stone">Phone</dt><dd><a href={`tel:${lead.phone}`}>{lead.phone}</a></dd></div>
          <div><dt className="text-stone">WhatsApp</dt><dd><a href={waLink(lead.whatsapp || lead.phone, `Hello ${lead.name}, this is CBH following up on ${lead.productName || "your enquiry"}.`)}>Open chat</a></dd></div>
          <div><dt className="text-stone">Email</dt><dd>{lead.email || "—"}</dd></div>
          <div><dt className="text-stone">Location</dt><dd>{lead.location}</dd></div>
          <div><dt className="text-stone">Product</dt><dd>{lead.productName} {lead.quantity ? `· ${formatQty(lead.quantity)}` : ""}</dd></div>
          <div><dt className="text-stone">Value</dt><dd>{lead.quoteValue != null ? money(lead.quoteValue) : "—"}</dd></div>
          <div><dt className="text-stone">Account</dt><dd className="capitalize">{lead.customerType}{lead.company ? ` · ${lead.company}` : ""}</dd></div>
          {lead.registration ? <div><dt className="text-stone">Registration</dt><dd>{lead.registration}</dd></div> : null}
          {lead.monthlyVolume ? <div><dt className="text-stone">Monthly volume</dt><dd>{lead.monthlyVolume}</dd></div> : null}
          {lead.creditRequest ? <div><dt className="text-stone">Credit</dt><dd>{lead.creditRequest}</dd></div> : null}
        </dl>
        {lead.requirements ? <p className="mt-4 text-sm">{lead.requirements}</p> : null}
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
          <SmartForm action={updateLead} submit="Save lead">
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
          <h2 className="display text-2xl">Quotations</h2>
          {lead.quotes.map((quote) => (
            <p key={quote.id} className="mt-2"><Link href={`/q/${quote.publicToken}`}>{quote.number}</Link> · {money(quote.total)}</p>
          ))}
          {lead.orders.map((order) => <p key={order.id} className="mt-2">{order.number} · {order.status}</p>)}
          <p className="mt-3 text-xs text-stone">Known sources include {LEAD_SOURCES.join(", ")}.</p>
        </div>
      </div>
    </div>
  );
}
