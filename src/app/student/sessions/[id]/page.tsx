"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  GraduationCap,
  Target,
} from "lucide-react";
import { SessionDTO } from "@/types";
import { formatDate, parseArrayField } from "@/lib/utils";

export default function StudentSessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success) setUser(meData.data.user);

        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Failed to load session details.");
          setIsLoading(false);
          return;
        }

        setSession(data.data);
        setIsLoading(false);
      } catch (err: any) {
        setError("Network error loading session.");
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-4xl">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Learning Hub
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 rounded-2xl bg-card border border-border" />
            <div className="h-64 rounded-2xl bg-card border border-border" />
          </div>
        ) : session ? (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-border/80 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={session.status} />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(session.scheduledAt)} ({session.durationMins} mins)
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">{session.topic}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Tutor: <span className="font-semibold text-foreground">{session.tutor?.name}</span>
              </p>
            </div>

            {/* Session Plan (Read-Only) */}
            {session.plan && (
              <Card className="glass-panel border-border/80">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-400">
                    <BookOpen className="w-4 h-4" /> Lesson Plan & Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-foreground block mb-1.5">Objectives:</span>
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {parseArrayField(session.plan.objectives).map((obj, i) => (
                        <li key={i} className="text-foreground">{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {parseArrayField(session.plan.practiceQuestions).length > 0 && (
                    <div>
                      <span className="font-bold text-foreground block mb-1.5">Practice Problems:</span>
                      <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                        {parseArrayField(session.plan.practiceQuestions).map((q, i) => (
                          <li key={i} className="p-2 rounded-lg bg-secondary/40 border border-border/40 text-foreground">
                            {q}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tutor Notes */}
            {session.notes && (
              <Card className="glass-panel border-border/80">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" /> Session Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 text-muted-foreground leading-relaxed italic">
                    &quot;{session.notes}&quot;
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Post-Session Debrief & Homework */}
            {session.debrief && (
              <Card className="glass-panel border-emerald-500/30 bg-emerald-500/5">
                <CardHeader className="pb-3 border-b border-emerald-500/20">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-400">
                    <Sparkles className="w-4 h-4" /> AI Debrief & Homework Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 block mb-1">Performance Summary:</span>
                    <p className="text-muted-foreground leading-relaxed">{session.debrief.summary}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/40">
                    <span className="font-bold text-foreground block mb-1.5">Assigned Homework:</span>
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {parseArrayField(session.debrief.homework).map((hw, i) => (
                        <li key={i} className="text-foreground">{hw}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <span className="font-bold text-emerald-400 block mb-0.5">Next Session Strategic Focus:</span>
                    <p>{session.debrief.nextFocus}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
