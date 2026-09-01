import { SessionStatus } from "@/types";

export const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  SCHEDULED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: ["AI_REVIEWED"],
  AI_REVIEWED: [],
};

export function isValidTransition(current: SessionStatus, next: SessionStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

export const STATUS_LABELS: Record<SessionStatus, { label: string; color: string; bg: string; border: string }> = {
  SCHEDULED: {
    label: "Scheduled",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    border: "border-blue-200 dark:border-blue-800",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    border: "border-purple-200 dark:border-purple-800",
  },
  AI_REVIEWED: {
    label: "AI Reviewed",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-800",
  },
};

export const COOKIE_NAME = "tutorflow_token";
export const JWT_EXPIRY = "7d";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
