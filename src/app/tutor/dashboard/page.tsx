"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { StudentCard } from "@/components/tutor/StudentCard";
import { NewStudentModal } from "@/components/modals/NewStudentModal";
import { ProgressSummaryModal } from "@/components/modals/ProgressSummaryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Search, Users, Play, Calendar, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TutorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [progressSummaryModal, setProgressSummaryModal] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    subject: string;
  }>({
    isOpen: false,
    studentId: "",
    studentName: "",
    subject: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch current tutor info
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.success) {
        setUser(meData.data.user);
      }

      // 2. Fetch students list with stats
      const studentsRes = await fetch("/api/students");
      const studentsData = await studentsRes.json();
      if (studentsData.success) {
        setStudents(studentsData.data);
      }

      // 3. Fetch recent sessions
      const sessionsRes = await fetch("/api/sessions");
      const sessionsData = await sessionsRes.json();
      if (sessionsData.success) {
        setSessions(sessionsData.data);
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error("Dashboard data fetch failed:", err);
      setError("Failed to load dashboard data. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOrUpcomingSessions = sessions.filter(
    (s) => s.status === "IN_PROGRESS" || s.status === "SCHEDULED"
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-7xl">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" /> Tutor Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user ? user.name : "Tutor"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage student learning arcs, structured AI lesson plans, and real-time live sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-1.5 text-xs"
              isLoading={isLoading}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsNewStudentOpen(true)}
              className="gap-1.5 text-xs shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Active / Upcoming Alert Strip */}
        {activeOrUpcomingSessions.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-amber-500" /> Active & Upcoming Sessions
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                {activeOrUpcomingSessions.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeOrUpcomingSessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    sess.status === "IN_PROGRESS"
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-border/60 bg-secondary/40"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={sess.status} />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(sess.scheduledAt)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground truncate">{sess.topic}</h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Student: <span className="font-semibold text-foreground">{sess.student?.name}</span>
                    </p>
                  </div>

                  <Link href={`/tutor/sessions/${sess.id}`} className="flex-shrink-0">
                    <Button
                      size="sm"
                      variant={sess.status === "IN_PROGRESS" ? "gradient" : "outline"}
                      className="h-8 text-xs px-3"
                    >
                      {sess.status === "IN_PROGRESS" ? "Resume" : "Open"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Roster Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Your Students ({students.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Click any student to review their chronological timeline or generate an AI progress summary.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl border border-border bg-card/40 animate-pulse p-4" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl p-6">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <h3 className="font-semibold text-sm">No students found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No students matched your search criteria."
                  : "You haven't added any students to your account yet. Click 'Add Student' to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onOpenProgressSummary={(id, name, subj) =>
                    setProgressSummaryModal({
                      isOpen: true,
                      studentId: id,
                      studentName: name,
                      subject: subj,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <NewStudentModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        onStudentCreated={fetchData}
      />

      <ProgressSummaryModal
        isOpen={progressSummaryModal.isOpen}
        onClose={() => setProgressSummaryModal((prev) => ({ ...prev, isOpen: false }))}
        studentId={progressSummaryModal.studentId}
        studentName={progressSummaryModal.studentName}
        subject={progressSummaryModal.subject}
      />
    </div>
  );
}
