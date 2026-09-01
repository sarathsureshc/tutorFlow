import React from "react";
import { SessionStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Calendar, PlayCircle, CheckCircle2, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const meta = STATUS_LABELS[status] || {
    label: status,
    color: "text-gray-700 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800",
    border: "border-gray-300 dark:border-gray-700",
  };

  const icons: Record<SessionStatus, React.ReactNode> = {
    SCHEDULED: <Calendar className="w-3 h-3 mr-1" />,
    IN_PROGRESS: <PlayCircle className="w-3 h-3 mr-1 animate-pulse" />,
    COMPLETED: <CheckCircle2 className="w-3 h-3 mr-1" />,
    AI_REVIEWED: <Sparkles className="w-3 h-3 mr-1" />,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        meta.bg,
        meta.color,
        meta.border,
        className
      )}
    >
      {showIcon && icons[status]}
      {meta.label}
    </span>
  );
}
