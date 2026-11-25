"use client";

import { useActionState, useEffect, useRef } from "react";
import { moveLeadStage } from "@/lib/actions/admin";
import { STAGE_REASONS, leadStatusLabel, type FormState } from "@/lib/types";

export type StageMove = {
  leadId: string;
  leadName: string;
  fromStatus: string;
  toStatus: string;
  followUpDate?: string | null;
  nextAction?: string | null;
};

export function LeadStageDialog({
  move,
  onClose,
  onDone,
}: {
  move: StageMove | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(moveLeadStage, null as FormState);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!move) {
      doneRef.current = false;
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [move, onClose]);

  useEffect(() => {
    if (state?.success && move && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [state, move, onDone]);

  if (!move) return null;

  const toLabel = leadStatusLabel(move.toStatus);
  const fromLabel = leadStatusLabel(move.fromStatus);
  const sameStage = move.fromStatus === move.toStatus;
  const closing = move.toStatus === "won" || move.toStatus === "lost";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a4a]/50 p-3 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Cancel" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-dialog-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-white p-5 shadow-2xl"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
          {sameStage ? "Log CRM update" : "Confirm stage change"}
        </p>
        <h2 id="stage-dialog-title" className="display mt-1 text-2xl text-ink">
          {move.leadName}
        </h2>
        <p className="mt-1 text-sm text-stone">
          {sameStage ? (
            <>Staying in <span className="font-semibold text-ink">{toLabel}</span> — capture why, and any next action.</>
          ) : (
            <>
              {fromLabel} → <span className="font-semibold text-ink">{toLabel}</span>
            </>
          )}
        </p>

        <form action={action} className="mt-4 grid gap-3" key={`${move.leadId}-${move.toStatus}-${move.fromStatus}`}>
          <input type="hidden" name="id" value={move.leadId} />
          <input type="hidden" name="status" value={move.toStatus} />
          <input type="hidden" name="confirm" value="1" />

          <label>
            <span className="label">Why this stage? (tag)</span>
            <select className="field" name="reason" defaultValue={closing ? "" : "awaiting_customer"} required={closing}>
              <option value="">Select a reason…</option>
              {STAGE_REASONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">Confirmation note *</span>
            <textarea
              className="field min-h-28"
              name="message"
              required
              minLength={5}
              placeholder="What changed? What does the customer want? Why are they still here / moving on?"
              autoFocus
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Follow-up date</span>
              <input className="field" type="date" name="followUpDate" defaultValue={move.followUpDate ?? ""} />
            </label>
            <label>
              <span className="label">Next action</span>
              <input
                className="field"
                name="followUpAction"
                defaultValue={move.nextAction ?? ""}
                placeholder="e.g. Send revised quote"
              />
            </label>
          </div>

          {state?.error ? <p className="text-sm font-semibold text-[#e11d48]">{state.error}</p> : null}

          <div className="mt-1 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Saving…" : sameStage ? "Save update" : `Confirm → ${toLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
