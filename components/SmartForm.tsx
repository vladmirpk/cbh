"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/types";

export function SmartForm({
  action,
  children,
  submit,
  className = "grid gap-4",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submit: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error ? <p className="text-sm font-medium text-[#b42318]">{state.error}</p> : null}
      {state?.success ? <p className="rounded-2xl bg-olive/10 px-4 py-3 text-sm text-olive">{state.success}</p> : null}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Sending…" : submit}
      </button>
    </form>
  );
}
