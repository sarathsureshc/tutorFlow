import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateSessionDebrief } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/session-debrief — Generate structured post-session debrief and transition to AI_REVIEWED
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

    // Must be COMPLETED (or already AI_REVIEWED if regenerating)
    if (session.status !== "COMPLETED" && session.status !== "AI_REVIEWED") {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid state: AI debrief can only be generated for 'COMPLETED' sessions. Current status is '${session.status}'.`,
        },
        { status: 409 }
      );
    }

    const profile = session.student.profile;
    const rawNotes = session.notes || "Session completed with standard practice drills.";

    // Generate structured debrief
    const debriefResult = await generateSessionDebrief({
      topic: session.topic,
      studentName: session.student.name,
      subject: profile?.subject || "Tutoring Subject",
      weakAreas: profile?.weakAreas || "General problem solving",
      tutorNotes: rawNotes,
    });

    const serialize = (val: any) => (typeof val === "string" ? val : JSON.stringify(val));

    // Save Debrief and transition state to AI_REVIEWED transactionally
    const { savedDebrief, updatedSession } = await prisma.$transaction(async (tx) => {
      const savedDebrief = await tx.sessionDebrief.upsert({
        where: { sessionId: session.id },
        create: {
          sessionId: session.id,
          summary: debriefResult.summary,
          homework: serialize(debriefResult.homework) as any,
          nextFocus: debriefResult.nextFocus,
        },
        update: {
          summary: debriefResult.summary,
          homework: serialize(debriefResult.homework) as any,
          nextFocus: debriefResult.nextFocus,
          generatedAt: new Date(),
        },
      });

      const updatedSession = await tx.session.update({
        where: { id: session.id },
        data: {
          status: "AI_REVIEWED",
        },
      });

      return { savedDebrief, updatedSession };
    });

    return NextResponse.json({
      success: true,
      data: {
        debrief: {
          id: savedDebrief.id,
          sessionId: session.id,
          summary: debriefResult.summary,
          homework: debriefResult.homework,
          nextFocus: debriefResult.nextFocus,
          generatedAt: savedDebrief.generatedAt,
        },
        session: updatedSession,
      },
      message: "AI Debrief generated and session marked as AI_REVIEWED.",
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("POST /api/ai/session-debrief error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
