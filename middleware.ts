import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  const token = request.cookies.get("cbh_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role === "customer") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("cbh_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
