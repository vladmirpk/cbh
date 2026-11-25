"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { moveLeadStage } from "@/lib/actions/admin";
import { LEAD_STATUSES, STAGE_REASONS, leadStatusLabel, type FormState } from "@/lib/types";

export function LeadPipelinePanel({
  lead,
  people,
  canAssign,
}: {
  lead: {
    id: string;
    status: string;
    assignedToId: string | null;
    followUpDate: string | null;
    nextAction: string | null;
    stageReason: string | null;
    quoteValue: number | null;
  };
  people: { id: string; name: string }[];
  canAssign: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [state, action, pending] = useActionState(moveLeadStage, null as FormState);
  const statusChanged = status !== lead.status;

  useEffect(() => {
    setStatus(lead.status);
  }, [lead.status]);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <div className="panel p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">Pipeline</p>
      <h2 className="display mt-1 text-2xl text-ink">Stage & follow-up</h2>
      <p className="mt-1 text-sm text-stone">
        Every stage change needs a confirmation note. Optional next actions keep the desk honest.
      </p>

      <form action={action} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={lead.id} />
        <input type="hidden" name="confirm" value="1" />

        <label>
          <span className="label">Status</span>
          <select className="field" name="status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {LEAD_STATUSES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>

        {statusChanged ? (
          <p className="rounded-xl border border-gold/40 bg-[#fff8db] px-3 py-2 text-xs font-semibold text-[#10233f]">
            Moving to {leadStatusLabel(status)} — confirmation note required below.
          </p>
        ) : null}

        <label>
          <span className="label">Why here / why moving (tag)</span>
          <select className="field" name="reason" defaultValue={lead.stageReason ?? ""} required={status === "won" || status === "lost"}>
            <option value="">Select a reason…</option>
            {STAGE_REASONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="label">{statusChanged ? "Confirmation note *" : "Update note *"}</span>
          <textarea
            className="field min-h-24"
            name="message"
            required
            minLength={5}
            placeholder="What the customer said, what changed, what we promised next…"
          />
        </label>

        {canAssign ? (
          <label>
            <span className="label">Salesperson</span>
            <select className="field" name="assignedToId" defaultValue={lead.assignedToId ?? ""}>
              <option value="">Unassigned</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="assignedToId" value={lead.assignedToId ?? ""} />
        )}

        <label>
          <span className="label">Follow-up date</span>
          <input className="field" type="date" name="followUpDate" defaultValue={lead.followUpDate ?? ""} />
        </label>
        <label>
          <span className="label">Next action</span>
          <input className="field" name="followUpAction" defaultValue={lead.nextAction ?? ""} placeholder="e.g. Call about revised tonnage" />
        </label>
        <label>
          <span className="label">Quote value</span>
          <input className="field" name="quoteValue" defaultValue={lead.quoteValue ?? ""} />
        </label>

        {state?.error ? <p className="text-sm font-semibold text-[#e11d48]">{state.error}</p> : null}
        {state?.success ? <p className="text-sm font-semibold text-[#0c3c8c]">{state.success}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : statusChanged ? `Confirm → ${leadStatusLabel(status)}` : "Save CRM update"}
        </button>
      </form>
    </div>
  );
}
