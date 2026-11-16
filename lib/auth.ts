import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "cbh_session";

export type Session = {
  sub: string;
  email: string;
  role: string;
  name: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function signSession(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || !payload.email || !payload.role || !payload.name) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: String(payload.role),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readToken(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.active) redirect("/admin/login");
  return user;
}
