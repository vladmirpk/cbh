"use client";

import { useActionState, useRef, useState } from "react";
import type { FormState } from "@/lib/types";
import { ConfirmSheet, type ConfirmPayload } from "@/components/site/ConfirmSheet";

export function SmartForm({
  action,
  children,
  submit,
  className = "grid gap-4",
  confirm,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submit: string;
  className?: string;
  confirm?: ConfirmPayload;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [open, setOpen] = useState(false);
  const skipConfirm = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className={className}
        onSubmit={(event) => {
          if (!confirm) return;
          if (skipConfirm.current) {
            skipConfirm.current = false;
            return;
          }
          event.preventDefault();
          setOpen(true);
        }}
      >
        {children}
        {state?.error ? <p className="text-sm font-medium text-[#b42318]">{state.error}</p> : null}
        {state?.success ? <p className="rounded-2xl bg-[#e7f6ee] px-4 py-3 text-sm text-[#157347]">{state.success}</p> : null}
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Sending…" : submit}
        </button>
      </form>
      {confirm ? (
        <ConfirmSheet
          open={open}
          payload={confirm}
          busy={pending}
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false);
            skipConfirm.current = true;
            formRef.current?.requestSubmit();
          }}
        />
      ) : null}
    </>
  );
}
