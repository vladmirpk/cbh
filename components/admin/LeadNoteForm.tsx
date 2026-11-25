"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addNote } from "@/lib/actions/admin";
import { STAGE_REASONS, type FormState } from "@/lib/types";

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addNote, null as FormState);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="panel grid gap-3 p-4">
      <input type="hidden" name="leadId" value={leadId} />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">Desk note</p>
        <h2 className="display mt-1 text-xl text-ink">Log progress</h2>
      </div>
      <label>
        <span className="label">Reason tag</span>
        <select className="field" name="reason" defaultValue="">
          <option value="">Optional…</option>
          {STAGE_REASONS.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">What happened *</span>
        <textarea className="field min-h-24" name="body" required placeholder="Call outcome, change request, objection, promise made…" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="label">Follow-up date</span>
          <input className="field" type="date" name="followUpDate" />
        </label>
        <label>
          <span className="label">Next action</span>
          <input className="field" name="followUpAction" placeholder="Optional follow-up action" />
        </label>
      </div>
      {state?.error ? <p className="text-sm font-semibold text-[#e11d48]">{state.error}</p> : null}
      {state?.success ? <p className="text-sm font-semibold text-[#0c3c8c]">{state.success}</p> : null}
      <button type="submit" className="btn btn-ink" disabled={pending}>
        {pending ? "Saving…" : "Add to timeline"}
      </button>
    </form>
  );
}
