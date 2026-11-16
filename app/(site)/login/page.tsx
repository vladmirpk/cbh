"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="bg-[#f6f8fc] py-16">
      <form action={action} className="mx-auto grid w-[min(440px,calc(100%-2rem))] gap-4 rounded-3xl border border-[#e6eef8] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#0c3c8c]">Login</h1>
        <label><span className="label">Email</span><input className="field" name="email" type="email" required /></label>
        <label><span className="label">Password</span><input className="field" name="password" type="password" required /></label>
        {state?.error ? <p className="text-sm font-medium text-[#c2410c]">{state.error}</p> : null}
        <button className="btn btn-primary" disabled={pending}>{pending ? "Checking…" : "Login"}</button>
        <p className="text-sm text-[#3d5a80]">New to CBH? <Link href="/register" className="font-bold text-[#0c3c8c]">Register</Link></p>
      </form>
    </div>
  );
}
