import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { isValidTransition, ALLOWED_TRANSITIONS } from "@/lib/constants";
import { SessionStatus } from "@/types";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/sessions/[id]/status — Enforce server-side state machine transitions
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tutor = await requireAuth(["TUTOR"]);
    const sessionId = params.id;
    const body = await req.json();
    const { status: nextStatus } = body;

    if (!nextStatus) {
      return NextResponse.json(
        { success: false, error: "Missing required field: status." },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
    }

    // Verify session belongs to authenticated tutor
    if (session.tutorId !== tutor.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have access to this session." },
        { status: 403 }
      );
    }

    const currentStatus = session.status as SessionStatus;

    // Strict state machine validation
    if (!isValidTransition(currentStatus, nextStatus as SessionStatus)) {
      const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
      return NextResponse.json(
        {
          success: false,
          error: `Invalid state transition: Cannot transition session from '${currentStatus}' to '${nextStatus}'. Allowed transitions from '${currentStatus}': [${allowed.join(", ") || "None — Terminal state"}].`,
        },
        { status: 409 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: nextStatus as SessionStatus,
      },
      include: {
        plan: true,
        debrief: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSession,
      message: `Session state transitioned to '${nextStatus}' successfully.`,
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("PATCH /api/sessions/[id]/status error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
