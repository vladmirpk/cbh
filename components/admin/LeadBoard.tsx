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

const COLUMN_TONE: Record<string, string> = {
  new: "bg-[#fff8db] text-[#8a6a00]",
  contacted: "bg-[#e8eef8] text-ink",
  quoted: "bg-[#e8eef8] text-ink",
  negotiating: "bg-[#e8eef8] text-ink",
  won: "bg-[#e7f6ee] text-[#157347]",
  lost: "bg-[#f4f4f5] text-stone",
};

const COLUMN_BAR: Record<string, string> = {
  new: "bg-gold",
  contacted: "bg-[#0c3c8c]/40",
  quoted: "bg-[#0c3c8c]",
  negotiating: "bg-[#071a4a]",
  won: "bg-[#16a34a]",
  lost: "bg-[#94a3b8]",
};

export function LeadBoard({ leads }: { leads: BoardLead[] }) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [move, setMove] = useState<StageMove | null>(null);

  const onDone = useCallback(() => {
    setMove(null);
    router.refresh();
  }, [router]);

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 lg:-mx-0 lg:px-0">
        <div className="flex min-w-[1100px] gap-3 xl:min-w-0 xl:grid xl:grid-cols-6">
          {LEAD_STATUSES.map((column) => {
            const columnLeads = leads.filter((lead) => lead.status === column.id);
            const activeDrop = dragging && over === column.id;
            return (
              <section
                key={column.id}
                className={`flex w-[220px] shrink-0 flex-col rounded-2xl border bg-white transition xl:w-auto ${
                  activeDrop ? "border-[#0c3c8c] shadow-[0_0_0_3px_rgba(12,60,140,0.12)]" : "border-line"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOver(column.id);
                }}
                onDragLeave={() => setOver((value) => (value === column.id ? null : value))}
                onDrop={() => {
                  if (!dragging) return;
                  const lead = leads.find((item) => item.id === dragging);
                  setDragging(null);
                  setOver(null);
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
                <header className="border-b border-line px-3 py-3">
                  <div className={`mb-2 h-1 w-10 rounded-full ${COLUMN_BAR[column.id] || "bg-line"}`} />
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-ink">{column.label.replace(" lead", "")}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${COLUMN_TONE[column.id] || "bg-plaster text-ink"}`}>
                      {columnLeads.length}
                    </span>
                  </div>
                </header>

                <div className="flex min-h-[12rem] flex-1 flex-col gap-2 p-2.5">
                  {columnLeads.map((lead) => (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={() => setDragging(lead.id)}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                      }}
                      className={`rounded-xl border border-line bg-plaster/60 p-3 transition hover:border-[#0c3c8c]/35 hover:bg-white ${
                        dragging === lead.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="min-w-0 font-extrabold leading-snug text-ink hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {lead.name}
                        </Link>
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0c3c8c]/35" aria-hidden title="Drag to move" />
                      </div>

                      <p className="mt-1 truncate text-xs text-stone">
                        {lead.productName || "No product yet"}
                      </p>
                      <p className="truncate text-[11px] text-stone">{lead.location}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-ink">{lead.quoteValue != null ? money(lead.quoteValue) : "—"}</span>
                        <span className="text-stone">·</span>
                        <span className="capitalize text-stone">{lead.source}</span>
                      </div>

                      {lead.followUpDate || lead.nextAction || lead.stageReason ? (
                        <div className="mt-2 space-y-1 border-t border-line/80 pt-2">
                          {lead.followUpDate ? (
                            <p className="text-[11px] font-bold text-[#8a6a00]">Due {lead.followUpDate}</p>
                          ) : null}
                          {lead.nextAction ? (
                            <p className="line-clamp-2 text-[11px] font-semibold text-ink">{lead.nextAction}</p>
                          ) : null}
                          {lead.stageReason && !lead.nextAction ? (
                            <p className="truncate text-[11px] text-stone">{stageReasonLabel(lead.stageReason)}</p>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-2.5 flex gap-2">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-plaster"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold text-stone hover:bg-white hover:text-ink"
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
                          Log
                        </button>
                      </div>
                    </article>
                  ))}

                  {!columnLeads.length ? (
                    <p className="px-1 py-6 text-center text-xs text-stone">Drop a lead here</p>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <LeadStageDialog move={move} onClose={() => setMove(null)} onDone={onDone} />
    </>
  );
}
