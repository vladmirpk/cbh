"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { SESSION_COOKIE, signSession } from "../auth";
import { audit } from "../notify";
import type { FormState } from "../types";
import { str } from "../types";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !user.active || !matches) {
    return { error: "Those details do not match a CBH account." };
  }
  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  await audit("login", "user", user.id, user.role, user.email);
  redirect(user.role === "customer" ? "/account" : "/admin");
}

export async function registerCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const password = String(formData.get("password") ?? "");
  if (name.length < 2 || !email.includes("@")) return { error: "Enter your name and email." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "That email is already registered. Sign in instead." };
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      role: "customer",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  const token = await signSession({ sub: user.id, email: user.email, role: user.role, name: user.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  await audit("register", "user", user.id, "customer", user.email);
  redirect("/account");
}

export async function logoutPublic() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
