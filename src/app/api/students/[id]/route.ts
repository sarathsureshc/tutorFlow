import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/students/[id] — Fetch comprehensive student profile and all chronological sessions
 * [id] can be the StudentProfile id or the User id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const studentIdentifier = params.id;

    // Find profile either by profile.id or profile.userId
    const profile = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id: studentIdentifier }, { userId: studentIdentifier }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Student profile not found." },
        { status: 404 }
      );
    }

    // Access Control:
    // If TUTOR: must be the tutor assigned to this student
    // If STUDENT: must be this specific student
    if (user.role === "TUTOR" && profile.tutorId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have access to this student." },
        { status: 403 }
      );
    }

    if (user.role === "STUDENT" && profile.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot access another student's profile." },
        { status: 403 }
      );
    }

    // Single query to fetch all sessions in chronological order with plan and debrief (0 N+1)
    const sessions = await prisma.session.findMany({
      where: {
        studentId: profile.userId,
        ...(user.role === "TUTOR" ? { tutorId: user.id } : {}),
      },
      include: {
        plan: true,
        debrief: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Parse JSON fields if using SQLite stringified fallback
    const parsedSessions = sessions.map((sess) => ({
      ...sess,
      plan: sess.plan
        ? {
            ...sess.plan,
            objectives:
              typeof sess.plan.objectives === "string"
                ? JSON.parse(sess.plan.objectives)
                : sess.plan.objectives,
            lessonOutline:
              typeof sess.plan.lessonOutline === "string"
                ? JSON.parse(sess.plan.lessonOutline)
                : sess.plan.lessonOutline,
            practiceQuestions:
              typeof sess.plan.practiceQuestions === "string"
                ? JSON.parse(sess.plan.practiceQuestions)
                : sess.plan.practiceQuestions,
          }
        : null,
      debrief: sess.debrief
        ? {
            ...sess.debrief,
            homework:
              typeof sess.debrief.homework === "string"
                ? JSON.parse(sess.debrief.homework)
                : sess.debrief.homework,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        profile,
        sessions: parsedSessions,
      },
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
