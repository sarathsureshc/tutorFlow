export type Role = "TUTOR" | "STUDENT";

export type SessionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "AI_REVIEWED";

export interface JWTPayload {
  sub: string;
  role: Role;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface StudentProfileDTO {
  id: string;
  userId: string;
  tutorId: string;
  subject: string;
  currentLevel: string;
  learningGoals: string;
  weakAreas: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SessionPlanDTO {
  id: string;
  sessionId: string;
  objectives: string[];
  lessonOutline: string[];
  practiceQuestions: string[];
  generatedAt: string | Date;
}

export interface SessionDebriefDTO {
  id: string;
  sessionId: string;
  summary: string;
  homework: string[];
  nextFocus: string;
  generatedAt: string | Date;
}

export interface SessionDTO {
  id: string;
  tutorId: string;
  studentId: string;
  scheduledAt: string | Date;
  durationMins: number;
  topic: string;
  status: SessionStatus;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  student?: {
    id: string;
    name: string;
    email: string;
    profile?: StudentProfileDTO | null;
  };
  tutor?: {
    id: string;
    name: string;
    email: string;
  };
  plan?: SessionPlanDTO | null;
  debrief?: SessionDebriefDTO | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AIPlanResponse {
  objectives: string[];
  lessonOutline: string[];
  practiceQuestions: string[];
}

export interface AIDebriefResponse {
  summary: string;
  homework: string[];
  nextFocus: string;
}

export interface AIProgressSummaryResponse {
  trajectory: string;
  masteredConcepts: string[];
  persistentStruggles: string[];
  actionableAdviceForTutor: string;
}
