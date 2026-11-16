"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateLead } from "@/lib/actions/admin";
import { money } from "@/lib/format";
import { LEAD_STATUSES } from "@/lib/types";

export type BoardLead = {
  id: string;
  name: string;
  productName: string | null;
  location: string;
  quoteValue: number | null;
  source: string;
  status: string;
  followUpDate: string | null;
};

export function LeadBoard({ leads }: { leads: BoardLead[] }) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [, start] = useTransition();
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {LEAD_STATUSES.map((column) => (
        <div
          key={column.id}
          className="rounded-2xl bg-white/70 p-2"
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!dragging) return;
            const data = new FormData();
            data.set("id", dragging);
            data.set("status", column.id);
            start(async () => {
              await updateLead(null, data);
              router.refresh();
            });
            setDragging(null);
          }}
        >
          <p className="px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-stone">{column.label}</p>
          <div className="grid gap-2">
            {leads.filter((lead) => lead.status === column.id).map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                draggable
                onDragStart={() => setDragging(lead.id)}
                className="block rounded-xl border border-line bg-card p-3 text-sm"
              >
                <p className="font-semibold">{lead.name}</p>
                <p className="text-stone">{lead.productName}</p>
                <p className="text-stone">{lead.location}</p>
                <p className="mt-1">{lead.quoteValue != null ? money(lead.quoteValue) : "—"} · {lead.source}</p>
                {lead.followUpDate ? <p className="text-xs text-brick">Follow up {lead.followUpDate}</p> : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
