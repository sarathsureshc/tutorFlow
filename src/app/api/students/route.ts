import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/students — List all students belonging to the authenticated tutor
 */
export async function GET() {
  try {
    const tutor = await requireAuth(["TUTOR"]);

    const profiles = await prisma.studentProfile.findMany({
      where: { tutorId: tutor.id },
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
      orderBy: { createdAt: "desc" },
    });

    // Fetch session statistics for each student in single batched query
    const studentUserIds = profiles.map((p) => p.userId);
    const sessions = await prisma.session.findMany({
      where: {
        tutorId: tutor.id,
        studentId: { in: studentUserIds },
      },
      select: {
        id: true,
        studentId: true,
        scheduledAt: true,
        status: true,
        topic: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Group sessions by studentId
    const sessionsByStudent = sessions.reduce((acc, sess) => {
      if (!acc[sess.studentId]) acc[sess.studentId] = [];
      acc[sess.studentId].push(sess);
      return acc;
    }, {} as Record<string, typeof sessions>);

    const enrichedStudents = profiles.map((profile) => {
      const studentSessions = sessionsByStudent[profile.userId] || [];
      const totalSessions = studentSessions.length;
      const completedSessions = studentSessions.filter(
        (s) => s.status === "COMPLETED" || s.status === "AI_REVIEWED"
      ).length;
      const nextSession = studentSessions
        .filter((s) => new Date(s.scheduledAt) > new Date() && s.status === "SCHEDULED")
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] || null;

      return {
        ...profile,
        stats: {
          totalSessions,
          completedSessions,
          nextSession,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedStudents,
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("GET /api/students error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

/**
 * POST /api/students — Create a new Student User & StudentProfile (Tutor only)
 */
export async function POST(req: NextRequest) {
  try {
    const tutor = await requireAuth(["TUTOR"]);
    const body = await req.json();

    const { name, email, password, subject, currentLevel, learningGoals, weakAreas } = body;

    if (!name || !email || !subject || !currentLevel || !learningGoals || !weakAreas) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required (name, email, subject, currentLevel, learningGoals, weakAreas).",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password || "password123", 10);

    // Transactionally create User and StudentProfile
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "STUDENT",
        },
      });

      const newProfile = await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          tutorId: tutor.id,
          subject: subject.trim(),
          currentLevel: currentLevel.trim(),
          learningGoals: learningGoals.trim(),
          weakAreas: weakAreas.trim(),
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

      return newProfile;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Student account created successfully.",
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, error: error.error }, { status: error.status });
    }
    console.error("POST /api/students error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
