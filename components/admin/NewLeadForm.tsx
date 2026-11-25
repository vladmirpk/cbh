"use client";

import { useActionState, useState } from "react";
import { createLead } from "@/lib/actions/admin";
import { LEAD_SOURCES, type FormState } from "@/lib/types";

export function NewLeadForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createLead, null as FormState);

  if (!open) {
    return (
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        New lead
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a4a]/50 p-3 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-white p-5 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">Sales desk</p>
        <h2 className="display mt-1 text-2xl text-ink">New lead</h2>
        <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">Name *</span>
            <input className="field" name="name" required />
          </label>
          <label>
            <span className="label">Phone *</span>
            <input className="field" name="phone" required />
          </label>
          <label>
            <span className="label">WhatsApp</span>
            <input className="field" name="whatsapp" />
          </label>
          <label>
            <span className="label">Email</span>
            <input className="field" name="email" type="email" />
          </label>
          <label>
            <span className="label">Location</span>
            <input className="field" name="location" defaultValue="Harare" />
          </label>
          <label>
            <span className="label">Company</span>
            <input className="field" name="company" />
          </label>
          <label>
            <span className="label">Account type</span>
            <select className="field" name="customerType" defaultValue="retail">
              <option value="retail">Retail</option>
              <option value="contractor">Contractor</option>
            </select>
          </label>
          <label>
            <span className="label">Product interest</span>
            <input className="field" name="productName" />
          </label>
          <label>
            <span className="label">Source</span>
            <select className="field" name="source" defaultValue="direct">
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Follow-up date</span>
            <input className="field" type="date" name="followUpDate" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Next action</span>
            <input className="field" name="nextAction" defaultValue="First contact" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Requirements / opening note</span>
            <textarea className="field min-h-20" name="requirements" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Timeline note</span>
            <textarea className="field min-h-16" name="message" placeholder="How this lead arrived on the desk…" />
          </label>
          {state?.error ? <p className="sm:col-span-2 text-sm font-semibold text-[#e11d48]">{state.error}</p> : null}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Create lead"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
