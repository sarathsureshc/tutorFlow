import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, Role, AuthenticatedUser } from "@/types";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "./constants";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "FATAL SECURITY ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters. A strong secret is required."
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a JWT with payload { sub, role, email, name }
 */
export async function signToken(payload: {
  sub: string;
  role: Role;
  email: string;
  name: string;
}): Promise<string> {
  return new SignJWT({
    role: payload.role,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

/**
 * Verify a JWT string and return the decoded payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return {
      sub: payload.sub as string,
      role: payload.role as Role,
      email: payload.email as string,
      name: payload.name as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract authenticated user from cookies in Next.js Server Components / Route Handlers
 */
export async function getSession(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.sub) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

/**
 * Set the authentication cookie on a response
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clear the authentication cookie on a response
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Enforce role-based access control inside API route handlers.
 * Throws an object with status code and error message if unauthorized.
 */
export async function requireAuth(allowedRoles?: Role[]): Promise<AuthenticatedUser> {
  const user = await getSession();

  if (!user) {
    throw { status: 401, error: "Authentication required. Please sign in." };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw {
      status: 403,
      error: `Forbidden: Access restricted to ${allowedRoles.join(", ")} role only.`,
    };
  }

  return user;
}
