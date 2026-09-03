"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  Target,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { SessionDTO, StudentProfileDTO } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.success) {
        setUser(meData.data.user);
        const uId = meData.data.user.id;

        // Fetch student's profile & sessions
        const res = await fetch(`/api/students/${uId}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data.profile);
          setSessions(data.data.sessions);
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      setError("Failed to load student dashboard data.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "COMPLETED" || s.status === "AI_REVIEWED"
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        {/* Student Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" /> Student Learning Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user ? user.name : "Student"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Review your upcoming lessons, assigned homework, and past session summaries.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchStudentData} className="text-xs gap-1.5 self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Hub
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 rounded-2xl bg-card border border-border" />
            <div className="h-48 rounded-2xl bg-card border border-border" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Student Learning Target Overview */}
            {profile && (
              <div className="glass-panel p-6 rounded-2xl border border-border/80 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="text-xs font-semibold">
                      {profile.subject}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {profile.currentLevel}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tutor: <strong className="text-foreground">Dr. Sarah Jenkins</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/50">
                    <span className="font-bold text-primary flex items-center gap-1.5 mb-1">
                      <Target className="w-3.5 h-3.5" /> My Learning Goals
                    </span>
                    <p className="text-muted-foreground">{profile.learningGoals}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/50">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Current Focus Areas
                    </span>
                    <p className="text-muted-foreground">{profile.weakAreas}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Sessions Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Upcoming Sessions ({upcomingSessions.length})
              </h2>

              {upcomingSessions.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  No upcoming sessions scheduled right now. Your tutor will notify you when the next slot is booked.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingSessions.map((sess) => (
                    <Card key={sess.id} className="glass-panel border-border/80">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <StatusBadge status={sess.status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(sess.scheduledAt)}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-foreground">{sess.topic}</CardTitle>
                        <CardDescription className="text-xs">Duration: {sess.durationMins} minutes</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Link href={`/student/sessions/${sess.id}`}>
                          <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                            View Plan & Prep <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Sessions & Homework Archive */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Past Sessions & Homework Archive ({pastSessions.length})
              </h2>

              {pastSessions.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  No completed sessions yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {pastSessions.map((sess) => (
                    <Card key={sess.id} className="glass-panel border-border/80">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <StatusBadge status={sess.status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(sess.scheduledAt)}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-foreground">{sess.topic}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0 text-xs">
                        {sess.debrief && (
                          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 space-y-2">
                            <div>
                              <span className="font-bold text-emerald-400 block mb-0.5">Session Summary:</span>
                              <p className="text-muted-foreground leading-relaxed">{sess.debrief.summary}</p>
                            </div>

                            <div>
                              <span className="font-bold text-foreground block mb-1">Assigned Homework:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                {sess.debrief.homework.map((hw, i) => (
                                  <li key={i} className="text-foreground">{hw}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-1 text-[11px] text-emerald-400 font-medium">
                              <strong>Next Lesson Focus:</strong> {sess.debrief.nextFocus}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <Link href={`/student/sessions/${sess.id}`}>
                            <Button size="sm" variant="ghost" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                              Full Notes <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
