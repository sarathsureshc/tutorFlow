import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateProgressSummary } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/progress-summary — Generate multi-session longitudinal student progress analysis
 */
export async function POST(req: NextRequest) {
  try {
    const tutor = await requireAuth(["TUTOR"]);
    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Missing studentId." }, { status: 400 });
    }

    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        userId: studentId,
        tutorId: tutor.id,
      },
      include: {
        user: true,
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Student not assigned to your tutor account." },
        { status: 403 }
      );
    }

    // Fetch all historical debriefs for this student in chronological order
    const sessions = await prisma.session.findMany({
      where: {
        studentId: studentProfile.userId,
        tutorId: tutor.id,
        debrief: { isNot: null },
      },
      include: {
        debrief: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    if (sessions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No completed or debriefed sessions found for this student yet. Complete at least 1 session with an AI debrief to generate a progress summary.",
        },
        { status: 400 }
      );
    }

    const chronologicalDebriefs = sessions.map((sess) => {
      let hw: string[] = [];
      if (sess.debrief?.homework) {
        if (typeof sess.debrief.homework === "string") {
          try {
            hw = JSON.parse(sess.debrief.homework);
          } catch {
            hw = [sess.debrief.homework];
          }
        } else if (Array.isArray(sess.debrief.homework)) {
          hw = sess.debrief.homework as string[];
        }
      }

      return {
        topic: sess.topic,
        date: sess.scheduledAt,
        summary: sess.debrief?.summary || "",
        homework: hw,
        nextFocus: sess.debrief?.nextFocus || "",
      };
    });

    const progressAnalysis = await generateProgressSummary({
      studentName: studentProfile.user.name,
      subject: studentProfile.subject,
      currentLevel: studentProfile.currentLevel,
      learningGoals: studentProfile.learningGoals,
      weakAreas: studentProfile.weakAreas,
      chronologicalDebriefs,
    });

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: studentProfile.userId,
          name: studentProfile.user.name,
          subject: studentProfile.subject,
          totalDebriefedSessions: sessions.length,
        },
        analysis: progressAnalysis,
        generatedAt: new Date().toISOString(),
      },
      message: "Student Longitudinal Progress Summary generated successfully.",
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("POST /api/ai/progress-summary error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
