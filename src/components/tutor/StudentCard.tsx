"use client";

import React from "react";
import Link from "next/link";
import { User, BookOpen, Calendar, ArrowRight, CheckCircle2, Clock, Plus, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface StudentCardProps {
  student: {
    id: string;
    userId: string;
    subject: string;
    currentLevel: string;
    learningGoals: string;
    weakAreas: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    stats?: {
      totalSessions: number;
      completedSessions: number;
      nextSession: any;
    };
  };
  onOpenProgressSummary: (studentId: string, studentName: string, subject: string) => void;
}

export function StudentCard({ student, onOpenProgressSummary }: StudentCardProps) {
  const stats = student.stats || {
    totalSessions: 0,
    completedSessions: 0,
    nextSession: null,
  };

  return (
    <Card className="glass-panel hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" /> {student.user.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {student.user.email} · {student.currentLevel}
            </CardDescription>
          </div>
          <Badge variant="purple" className="text-[11px] font-semibold">
            {student.subject}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3 text-xs">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/50">
          <div>
            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Sessions</span>
            <div className="font-bold text-foreground flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {stats.completedSessions} / {stats.totalSessions} Done
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Next Up</span>
            <div className="font-medium text-foreground truncate mt-0.5" title={stats.nextSession?.topic || "None scheduled"}>
              {stats.nextSession ? (
                <span className="text-blue-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {formatDate(stats.nextSession.scheduledAt)}
                </span>
              ) : (
                <span className="text-muted-foreground italic">No upcoming</span>
              )}
            </div>
          </div>
        </div>

        {/* Weak Areas Preview */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-amber-500/90 font-bold block mb-1">
            Focus Weak Areas
          </span>
          <p className="text-muted-foreground line-clamp-2 leading-relaxed text-[11px] italic">
            "{student.weakAreas}"
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenProgressSummary(student.userId, student.user.name, student.subject)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Progress
        </button>

        <div className="flex items-center gap-1.5">
          <Link href={`/tutor/students/${student.userId}/new-session`}>
            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1">
              <Plus className="w-3 h-3" /> Schedule
            </Button>
          </Link>
          <Link href={`/tutor/students/${student.userId}`}>
            <Button size="sm" variant="secondary" className="h-8 px-2.5 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              Timeline <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
