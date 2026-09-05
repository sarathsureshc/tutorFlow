import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { Role } from "@/types";
import { getClientIp, checkRateLimit, recordRateLimitAttempt, resetRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimitKey = `login_${clientIp}`;

    // Throttle login attempts: Max 5 attempts per 60 seconds per IP
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 1000);
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateLimit.retryAfterSec} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      recordRateLimitAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      recordRateLimitAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(rateLimitKey);

    const role = user.role as Role;

    const token = await signToken({
      sub: user.id,
      role,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
        },
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
