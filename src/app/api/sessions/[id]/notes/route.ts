import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/sessions/[id]/notes — Live notes autosave handler with state write-lock
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tutor = await requireAuth(["TUTOR"]);
    const sessionId = params.id;
    const body = await req.json();
    const { notes } = body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
    }

    if (session.tutorId !== tutor.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have access to this session." },
        { status: 403 }
      );
    }

    // Strict write-lock: notes can ONLY be edited while session is IN_PROGRESS
    if (session.status !== "IN_PROGRESS") {
      return NextResponse.json(
        {
          success: false,
          error: `Write Lock: Session notes can only be modified while the session is 'IN_PROGRESS'. Current status is '${session.status}'. Completed sessions are immutable.`,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: {
        notes: notes ?? "",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        notes: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Notes autosaved successfully.",
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("PATCH /api/sessions/[id]/notes error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
