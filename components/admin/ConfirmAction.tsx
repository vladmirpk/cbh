"use client";

import { useRef, useState } from "react";
import { ConfirmSheet, type ConfirmPayload } from "@/components/site/ConfirmSheet";

export function ConfirmAction({
  action,
  fields,
  label = "Delete",
  confirm,
  className = "inline-flex h-8 items-center rounded-full border border-[#f5c2c0] px-3 text-xs font-bold text-[#b42318] hover:bg-[#fff5f5]",
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  label?: string;
  confirm: ConfirmPayload;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const skip = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        onSubmit={(event) => {
          if (skip.current) {
            skip.current = false;
            setBusy(true);
            return;
          }
          event.preventDefault();
          setOpen(true);
        }}
      >
        {Object.entries(fields || {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" className={className} disabled={busy}>
          {busy ? "Working…" : label}
        </button>
      </form>
      <ConfirmSheet
        open={open}
        payload={{ ...confirm, tone: confirm.tone || "danger" }}
        busy={busy}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          skip.current = true;
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
