import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageLeads, canSeeAllLeads } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { LeadBoard } from "@/components/admin/LeadBoard";

export default async function LeadsPage() {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return <Denied />;
  const leads = await prisma.lead.findMany({
    where: canSeeAllLeads(user.role) ? {} : { OR: [{ assignedToId: user.id }, { assignedToId: null }] },
    orderBy: { createdAt: "desc" },
  });
  const followUps = leads.filter((lead) => lead.followUpDate && lead.status !== "won" && lead.status !== "lost");
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl">Leads</h1>
          <p className="mt-2 text-sm text-stone">Drag a card to move it. {followUps.length} still have a follow-up date.</p>
        </div>
        <a href="/api/export/leads" className="text-sm">Download CSV</a>
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
          }))}
        />
      </div>
      <div className="mt-8 md:hidden">
        {leads.map((lead) => <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="block border-b border-line py-3">{lead.name}</Link>)}
      </div>
    </div>
  );
}
