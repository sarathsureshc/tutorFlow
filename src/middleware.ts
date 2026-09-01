import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/constants";
import { Role } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "tutorflow_super_secret_production_key_2026_minimum_32_chars_long!";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, next internals, and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let user: { sub: string; role: Role; email: string; name: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      user = {
        sub: payload.sub as string,
        role: payload.role as Role,
        email: payload.email as string,
        name: payload.name as string,
      };
    } catch {
      user = null;
    }
  }

  // 1. Gating for /login page
  if (pathname === "/login") {
    if (user) {
      if (user.role === "TUTOR") {
        return NextResponse.redirect(new URL("/tutor/dashboard", request.url));
      }
      if (user.role === "STUDENT") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Gating for Tutor Routes (/tutor/*)
  if (pathname.startsWith("/tutor")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "TUTOR") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Gating for Student Routes (/student/*)
  if (pathname.startsWith("/student")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/tutor/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tutor/:path*", "/student/:path*", "/login"],
};
