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
  const open = leads.filter((lead) => !["won", "lost"].includes(lead.status));
  const withActions = leads.filter((lead) => lead.nextAction && !["won", "lost"].includes(lead.status));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">CRM</p>
          <h1 className="display mt-1 text-3xl text-ink md:text-4xl">Leads</h1>
          <p className="mt-1.5 text-sm text-stone">Drag a card to change stage. Each move needs a short confirmation note.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/api/export/leads" className="btn btn-ghost h-10 px-4 text-sm">
            Download CSV
          </Link>
          <NewLeadForm />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink">
          {leads.length} total
        </span>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink">
          {open.length} open
        </span>
        <span className="rounded-full border border-[#f5e6a8] bg-[#fff8db] px-3 py-1.5 text-xs font-bold text-[#8a6a00]">
          {followUps.length} follow-ups due
        </span>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-stone">
          {withActions.length} next actions
        </span>
      </div>

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
  );
}
