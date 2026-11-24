"use client";

import { useEffect } from "react";
import { Cover } from "./Cover";

export type ConfirmPayload = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  image?: string | null;
  detail?: string;
};

export function ConfirmSheet({
  open,
  payload,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  payload: ConfirmPayload | null;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open || !payload) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cbh-confirm-title">
      <button type="button" className="absolute inset-0 bg-[#071a4a]/45 backdrop-blur-[2px]" aria-label="Close" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-[sheet-up_0.22s_ease] rounded-t-3xl border border-line bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d7e2f2] sm:hidden" />
        <div className="flex gap-4">
          {payload.image !== undefined ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#e8eef8]">
              <Cover src={payload.image} alt="" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 id="cbh-confirm-title" className="text-xl font-extrabold text-ink">{payload.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone">{payload.message}</p>
            {payload.detail ? <p className="mt-2 text-sm font-semibold text-ink">{payload.detail}</p> : null}
          </div>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {payload.cancelLabel || "Not now"}
          </button>
          <button
            type="button"
            className={`btn ${payload.tone === "danger" ? "bg-[#b42318] text-white" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : payload.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
