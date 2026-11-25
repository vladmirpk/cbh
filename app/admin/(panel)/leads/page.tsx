import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/roles";
import { leadScope } from "@/lib/scope";
import { Denied } from "@/components/ui";
import { LeadBoard } from "@/components/admin/LeadBoard";
import { NewLeadForm } from "@/components/admin/NewLeadForm";

export default async function LeadsPage() {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const leads = await prisma.lead.findMany({
    where: leadScope({ id: user.id, role: user.role }),
    orderBy: { createdAt: "desc" },
  });
  const followUps = leads.filter((lead) => lead.followUpDate && lead.status !== "won" && lead.status !== "lost");
  const withActions = leads.filter((lead) => lead.nextAction && !["won", "lost"].includes(lead.status));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">CRM</p>
          <h1 className="display mt-1 text-4xl text-ink">Leads</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone">
            Drag a card to move stage — every move asks for a confirmation note, reason tag, and optional follow-up action.
            {" "}{followUps.length} dated follow-ups · {withActions.length} open next actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/api/export/leads" className="text-sm font-bold text-ink hover:underline">Download CSV</Link>
          <NewLeadForm />
        </div>
      </div>
      <div className="mt-6">
        <LeadBoard
          leads={leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            productName: lead.productName,
            location: lead.location,
            quoteValue: lead.quoteValue,
            source: lead.source,
            status: lead.status,
            followUpDate: lead.followUpDate,
            nextAction: lead.nextAction,
            stageReason: lead.stageReason,
          }))}
        />
      </div>
      <div className="mt-8 space-y-1 md:hidden">
        {leads.map((lead) => (
          <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center justify-between border-b border-line py-3 text-sm">
            <span className="font-semibold">{lead.name}</span>
            <span className="text-stone">{lead.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
