"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { money } from "@/lib/format";
import { LEAD_STATUSES, stageReasonLabel } from "@/lib/types";
import { LeadStageDialog, type StageMove } from "@/components/admin/LeadStageDialog";

export type BoardLead = {
  id: string;
  name: string;
  productName: string | null;
  location: string;
  quoteValue: number | null;
  source: string;
  status: string;
  followUpDate: string | null;
  nextAction?: string | null;
  stageReason?: string | null;
};

export function LeadBoard({ leads }: { leads: BoardLead[] }) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [move, setMove] = useState<StageMove | null>(null);

  const onDone = useCallback(() => {
    setMove(null);
    router.refresh();
  }, [router]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {LEAD_STATUSES.map((column) => {
          const columnLeads = leads.filter((lead) => lead.status === column.id);
          return (
            <div
              key={column.id}
              className={`rounded-2xl border border-line bg-white p-2 transition ${
                dragging ? "ring-1 ring-[#0c3c8c]/20" : ""
              }`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!dragging) return;
                const lead = leads.find((item) => item.id === dragging);
                setDragging(null);
                if (!lead || lead.status === column.id) return;
                setMove({
                  leadId: lead.id,
                  leadName: lead.name,
                  fromStatus: lead.status,
                  toStatus: column.id,
                  followUpDate: lead.followUpDate,
                  nextAction: lead.nextAction,
                });
              }}
            >
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">{column.label}</p>
                <span className="rounded-full bg-plaster px-2 py-0.5 text-[11px] font-bold text-ink">{columnLeads.length}</span>
              </div>
              <div className="grid min-h-[4.5rem] gap-2">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragging(lead.id)}
                    onDragEnd={() => setDragging(null)}
                    className="cursor-grab rounded-xl border border-line bg-card p-3 text-sm active:cursor-grabbing"
                  >
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-ink hover:underline" onClick={(event) => event.stopPropagation()}>
                      {lead.name}
                    </Link>
                    <p className="mt-0.5 truncate text-stone">{lead.productName || "No product yet"}</p>
                    <p className="truncate text-xs text-stone">{lead.location}</p>
                    <p className="mt-1 text-xs font-semibold text-ink">
                      {lead.quoteValue != null ? money(lead.quoteValue) : "—"} · {lead.source}
                    </p>
                    {lead.stageReason ? (
                      <p className="mt-1 text-[11px] text-stone">{stageReasonLabel(lead.stageReason)}</p>
                    ) : null}
                    {lead.nextAction ? (
                      <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-[#0c3c8c]">{lead.nextAction}</p>
                    ) : null}
                    {lead.followUpDate ? (
                      <p className="mt-1 text-[11px] font-bold text-[#8a6a00]">Follow up {lead.followUpDate}</p>
                    ) : null}
                    <div className="mt-2 flex gap-2">
                      <Link href={`/admin/leads/${lead.id}`} className="text-[11px] font-bold text-brick hover:underline">
                        Open
                      </Link>
                      <button
                        type="button"
                        className="text-[11px] font-bold text-stone hover:text-ink"
                        onClick={() =>
                          setMove({
                            leadId: lead.id,
                            leadName: lead.name,
                            fromStatus: lead.status,
                            toStatus: lead.status,
                            followUpDate: lead.followUpDate,
                            nextAction: lead.nextAction,
                          })
                        }
                      >
                        Log update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <LeadStageDialog move={move} onClose={() => setMove(null)} onDone={onDone} />
    </>
  );
}
