import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/sessions — Fetch sessions for the authenticated user (Tutor or Student)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("studentId");
    const statusParam = searchParams.get("status");

    const whereClause: any = {};

    if (user.role === "TUTOR") {
      whereClause.tutorId = user.id;
      if (studentIdParam) {
        whereClause.studentId = studentIdParam;
      }
    } else {
      // Student can only see their own sessions
      whereClause.studentId = user.id;
    }

    if (statusParam) {
      whereClause.status = statusParam;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
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
      orderBy: { scheduledAt: "desc" },
    });

    // Parse JSON fields if using SQLite fallback
    const formatted = sessions.map((sess) => ({
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
      data: formatted,
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

/**
 * POST /api/sessions — Schedule a new session with double-booking prevention
 */
export async function POST(req: NextRequest) {
  try {
    const tutor = await requireAuth(["TUTOR"]);
    const body = await req.json();

    const { studentId, scheduledAt, durationMins = 60, topic } = body;

    if (!studentId || !scheduledAt || !topic) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: studentId, scheduledAt, topic." },
        { status: 400 }
      );
    }

    const duration = parseInt(String(durationMins), 10) || 60;
    const newStart = new Date(scheduledAt);
    if (isNaN(newStart.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid scheduledAt timestamp." },
        { status: 400 }
      );
    }

    const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

    // Verify student belongs to this tutor
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        userId: studentId,
        tutorId: tutor.id,
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Student not assigned to your tutor account." },
        { status: 403 }
      );
    }

    // Double-Booking Overlap Check:
    // Check all active sessions (SCHEDULED, IN_PROGRESS) for this tutor
    const activeSessions = await prisma.session.findMany({
      where: {
        tutorId: tutor.id,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    const collision = activeSessions.find((sess) => {
      const existingStart = new Date(sess.scheduledAt);
      const existingEnd = new Date(existingStart.getTime() + sess.durationMins * 60 * 1000);
      // Overlap condition: ExistingStart < NewEnd AND ExistingEnd > NewStart
      return existingStart < newEnd && existingEnd > newStart;
    });

    if (collision) {
      const colStart = new Date(collision.scheduledAt);
      const colEnd = new Date(colStart.getTime() + collision.durationMins * 60 * 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Double-booking conflict: You already have a session ("${collision.topic}") scheduled from ${formatTime(colStart)} to ${formatTime(colEnd)} on ${colStart.toLocaleDateString()}.`,
        },
        { status: 409 }
      );
    }

    // Create session in SCHEDULED state
    const session = await prisma.session.create({
      data: {
        tutorId: tutor.id,
        studentId,
        scheduledAt: newStart,
        durationMins: duration,
        topic: topic.trim(),
        status: "SCHEDULED",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: session,
      message: "Session scheduled successfully.",
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
