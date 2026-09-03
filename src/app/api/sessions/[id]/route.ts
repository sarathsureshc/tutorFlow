import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/sessions/[id] — Fetch single session details with plan, debrief, and student profile
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const sessionId = params.id;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
        debrief: true,
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
    }

    // Access control
    if (user.role === "TUTOR" && session.tutorId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have access to this session." },
        { status: 403 }
      );
    }

    if (user.role === "STUDENT" && session.studentId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have access to this session." },
        { status: 403 }
      );
    }

    // Parse JSON fields
    const formatted = {
      ...session,
      plan: session.plan
        ? {
            ...session.plan,
            objectives:
              typeof session.plan.objectives === "string"
                ? JSON.parse(session.plan.objectives)
                : session.plan.objectives,
            lessonOutline:
              typeof session.plan.lessonOutline === "string"
                ? JSON.parse(session.plan.lessonOutline)
                : session.plan.lessonOutline,
            practiceQuestions:
              typeof session.plan.practiceQuestions === "string"
                ? JSON.parse(session.plan.practiceQuestions)
                : session.plan.practiceQuestions,
          }
        : null,
      debrief: session.debrief
        ? {
            ...session.debrief,
            homework:
              typeof session.debrief.homework === "string"
                ? JSON.parse(session.debrief.homework)
                : session.debrief.homework,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("GET /api/sessions/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
