"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { SessionTimelineItem } from "@/components/tutor/SessionTimelineItem";
import { ProgressSummaryModal } from "@/components/modals/ProgressSummaryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Plus,
  BookOpen,
  Target,
  AlertTriangle,
  GraduationCap,
  Clock,
  User,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { StudentProfileDTO, SessionDTO } from "@/types";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const fetchStudentData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch current user
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      // 2. Fetch student details with chronological sessions (single query join, 0 N+1)
      const res = await fetch(`/api/students/${studentId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load student details.");
        setIsLoading(false);
        return;
      }

      setProfile(data.data.profile);
      setSessions(data.data.sessions);
      setIsLoading(false);
    } catch (err: any) {
      setError("An unexpected error occurred while loading student.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        {/* Back navigation */}
        <Link
          href="/tutor/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-36 rounded-2xl bg-card border border-border" />
            <div className="h-64 rounded-2xl bg-card border border-border" />
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Student Header & Quick Action Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-border/80 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                      {profile.user.name.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-extrabold text-foreground">{profile.user.name}</h1>
                      <p className="text-xs text-muted-foreground">{profile.user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="purple" className="text-xs font-semibold">
                      {profile.subject}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <GraduationCap className="w-3 h-3 mr-1" /> {profile.currentLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" /> {sessions.length} Total Sessions
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProgressModalOpen(true)}
                    className="gap-2 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Progress Summary
                  </Button>

                  <Link href={`/tutor/students/${profile.userId}/new-session`}>
                    <Button variant="gradient" size="sm" className="gap-2 text-xs shadow-emerald-950/40">
                      <Plus className="w-4 h-4" /> Schedule Session
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Profile Deep-Dive Details */}
              <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50">
                  <span className="font-bold text-foreground flex items-center gap-1.5 mb-1 text-primary">
                    <Target className="w-3.5 h-3.5" /> Stated Learning Goals
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{profile.learningGoals}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50">
                  <span className="font-bold text-foreground flex items-center gap-1.5 mb-1 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> Persistent Weak Areas
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{profile.weakAreas}</p>
                </div>
              </div>
            </div>

            {/* Chronological Session Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Chronological Session Timeline
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Chronological progression from foundational sessions to upcoming lessons.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchStudentData} className="text-xs gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </Button>
              </div>

              {sessions.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-2xl p-6">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <h4 className="text-sm font-semibold">No sessions scheduled yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
                    Schedule a new 1:1 session to begin crafting AI lesson plans and tracking progress.
                  </p>
                  <Link href={`/tutor/students/${profile.userId}/new-session`}>
                    <Button size="sm" variant="gradient" className="gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Schedule First Session
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 pt-2">
                  {sessions.map((session, index) => (
                    <SessionTimelineItem
                      key={session.id}
                      session={session}
                      isLast={index === sessions.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Progress Summary Modal */}
            <ProgressSummaryModal
              isOpen={isProgressModalOpen}
              onClose={() => setIsProgressModalOpen(false)}
              studentId={profile.userId}
              studentName={profile.user.name}
              subject={profile.subject}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
