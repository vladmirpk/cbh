"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-ink p-10 text-plaster md:flex md:flex-col md:justify-between">
        <p className="display text-3xl">CBH</p>
        <div>
          <h1 className="display text-5xl leading-none">The sales desk.</h1>
          <p className="mt-4 max-w-sm text-white/80">Leads, quotations, campaigns and the delivery rate card. Customer records stay behind this login.</p>
        </div>
      </div>
      <div className="flex items-center px-6 py-16">
        <form action={action} className="mx-auto grid w-full max-w-sm gap-4">
          <h2 className="display text-4xl">Sign in</h2>
          <label><span className="label">Email</span><input className="field" name="email" type="email" required /></label>
          <label><span className="label">Password</span><input className="field" name="password" type="password" required /></label>
          {state?.error ? <p className="text-sm font-medium text-[#b42318]">{state.error}</p> : null}
          <button className="btn btn-primary" disabled={pending}>{pending ? "Checking…" : "Enter the desk"}</button>
          {process.env.NODE_ENV !== "production" ? (
            <p className="text-xs text-stone">Demo accounts use the password Cbh-Yard-2026. Start with admin@cbh.co.zw. Change these before the site is public.</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
