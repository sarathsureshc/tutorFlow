import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateSessionPlan } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/session-plan — Generate structured pre-session lesson plan using Gemini 2.5 Flash
 */
export async function POST(req: NextRequest) {
  try {
    const tutor = await requireAuth(["TUTOR"]);
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing sessionId." }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
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

    const profile = session.student.profile;
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Student profile not found." },
        { status: 404 }
      );
    }

    // Fetch previous 3 chronological sessions with debriefs for context injection
    const previousSessions = await prisma.session.findMany({
      where: {
        studentId: session.studentId,
        tutorId: tutor.id,
        scheduledAt: { lt: session.scheduledAt },
      },
      include: {
        debrief: true,
      },
      orderBy: { scheduledAt: "desc" },
      take: 3,
    });

    const previousSessionsContext = previousSessions.map((s) => ({
      topic: s.topic,
      summary: s.debrief?.summary || null,
      nextFocus: s.debrief?.nextFocus || null,
    }));

    // Generate grounded lesson plan
    const planResult = await generateSessionPlan({
      topic: session.topic,
      studentName: session.student.name,
      subject: profile.subject,
      currentLevel: profile.currentLevel,
      learningGoals: profile.learningGoals,
      weakAreas: profile.weakAreas,
      previousSessionsContext,
    });

    const serialize = (val: any) => (typeof val === "string" ? val : JSON.stringify(val));

    // Save or update SessionPlan in database
    const savedPlan = await prisma.sessionPlan.upsert({
      where: { sessionId: session.id },
      create: {
        sessionId: session.id,
        objectives: serialize(planResult.objectives) as any,
        lessonOutline: serialize(planResult.lessonOutline) as any,
        practiceQuestions: serialize(planResult.practiceQuestions) as any,
      },
      update: {
        objectives: serialize(planResult.objectives) as any,
        lessonOutline: serialize(planResult.lessonOutline) as any,
        practiceQuestions: serialize(planResult.practiceQuestions) as any,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedPlan.id,
        sessionId: session.id,
        objectives: planResult.objectives,
        lessonOutline: planResult.lessonOutline,
        practiceQuestions: planResult.practiceQuestions,
        generatedAt: savedPlan.generatedAt,
      },
      message: "AI Lesson Plan generated and saved successfully.",
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("POST /api/ai/session-plan error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
