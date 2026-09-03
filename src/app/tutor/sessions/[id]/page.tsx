"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Lock,
  Save,
  Check,
  GraduationCap,
  Target,
  AlertTriangle,
} from "lucide-react";
import { SessionDTO, SessionStatus } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlanGenerating, setIsPlanGenerating] = useState(false);
  const [isDebriefGenerating, setIsDebriefGenerating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSession = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to load session.");
        setIsLoading(false);
        return;
      }

      setSession(data.data);
      setNotes(data.data.notes || "");
      setIsLoading(false);
    } catch (err: any) {
      setErrorMessage("Network error loading session.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  // Debounced Auto-save handler (800ms)
  const debouncedSaveNotes = useDebouncedCallback(async (updatedNotes: string) => {
    if (!session || session.status !== "IN_PROGRESS") return;

    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/sessions/${session.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus("saved");
        setLastSavedAt(new Date().toLocaleTimeString());
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    }
  }, 800);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    if (session?.status === "IN_PROGRESS") {
      setSaveStatus("saving");
      debouncedSaveNotes(val);
    }
  };

  // State Machine Transition Handler
  const handleTransition = async (nextStatus: SessionStatus) => {
    setIsTransitioning(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to transition session state.");
        setIsTransitioning(false);
        return;
      }

      setSession(data.data);
      setIsTransitioning(false);
    } catch (err: any) {
      setErrorMessage("Failed to transition session status.");
      setIsTransitioning(false);
    }
  };

  // AI Plan Generation Handler
  const handleGeneratePlan = async () => {
    setIsPlanGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/session-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to generate AI session plan.");
        setIsPlanGenerating(false);
        return;
      }

      setSession((prev) => (prev ? { ...prev, plan: data.data } : null));
      setIsPlanGenerating(false);
    } catch (err: any) {
      setErrorMessage("Failed to generate AI plan. Network error.");
      setIsPlanGenerating(false);
    }
  };

  // AI Debrief Generation Handler
  const handleGenerateDebrief = async () => {
    setIsDebriefGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/session-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to generate AI debrief.");
        setIsDebriefGenerating(false);
        return;
      }

      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "AI_REVIEWED",
              debrief: data.data.debrief,
            }
          : null
      );
      setIsDebriefGenerating(false);
    } catch (err: any) {
      setErrorMessage("Failed to generate AI debrief. Network error.");
      setIsDebriefGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
        {/* Back Link */}
        {session && (
          <Link
            href={`/tutor/students/${session.studentId}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {session.student?.name}&apos;s Timeline
          </Link>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setErrorMessage(null)}
              className="h-7 text-[11px] border-destructive/30"
            >
              Dismiss
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 rounded-2xl bg-card border border-border" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 rounded-2xl bg-card border border-border" />
              <div className="h-96 rounded-2xl bg-card border border-border" />
            </div>
          </div>
        ) : session ? (
          <div className="space-y-6">
            {/* Header & State Control Banner */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-border/80 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={session.status} />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(session.scheduledAt)} ({session.durationMins} mins)
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-foreground">{session.topic}</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Student: <span className="font-semibold text-foreground">{session.student?.name}</span> ({session.student?.profile?.subject || "General"})
                  </p>
                </div>

                {/* State Machine Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {session.status === "SCHEDULED" && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => handleTransition("IN_PROGRESS")}
                      isLoading={isTransitioning}
                      className="gap-2 text-xs shadow-emerald-950/40"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Live Session
                    </Button>
                  )}

                  {session.status === "IN_PROGRESS" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTransition("COMPLETED")}
                      isLoading={isTransitioning}
                      className="gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> End & Mark Completed
                    </Button>
                  )}

                  {session.status === "COMPLETED" && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleGenerateDebrief}
                      isLoading={isDebriefGenerating}
                      className="gap-2 text-xs shadow-emerald-950/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate AI Debrief
                    </Button>
                  )}

                  {session.status === "AI_REVIEWED" && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" /> Session Fully Debriefed & Archived
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main 2-Column Split: AI Lesson Plan (Left) & Live Notes / Debrief (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Pre-Session Structured AI Lesson Plan */}
              <div className="space-y-6">
                <Card className="glass-panel border-border/80 h-full flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 mb-1">
                          <BookOpen className="w-3.5 h-3.5" /> Gemini 2.5 Flash Structured Plan
                        </div>
                        <CardTitle className="text-base font-bold">Pre-Session Lesson Plan</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGeneratePlan}
                        isLoading={isPlanGenerating}
                        className="text-xs gap-1.5 h-8 border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {session.plan ? "Regenerate" : "Generate Plan"}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 flex-1 space-y-4 text-xs overflow-y-auto max-h-[600px]">
                    {session.plan ? (
                      <div className="space-y-4 animate-in fade-in">
                        {/* Objectives */}
                        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                          <span className="font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                            <Target className="w-4 h-4" /> Targeted Pedagogical Objectives
                          </span>
                          <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                            {session.plan.objectives.map((obj, i) => (
                              <li key={i} className="text-foreground">{obj}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Lesson Outline */}
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50">
                          <span className="font-bold text-foreground flex items-center gap-1.5 mb-2">
                            <Clock className="w-4 h-4 text-primary" /> Timestamped Lesson Outline
                          </span>
                          <div className="space-y-2">
                            {session.plan.lessonOutline.map((item, i) => (
                              <div key={i} className="p-2 rounded-lg bg-background/60 border border-border/40 text-muted-foreground">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Practice Questions */}
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50">
                          <span className="font-bold text-foreground flex items-center gap-1.5 mb-2">
                            <GraduationCap className="w-4 h-4 text-emerald-400" /> Grounded Practice Questions
                          </span>
                          <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                            {session.plan.practiceQuestions.map((q, i) => (
                              <li key={i} className="p-2 rounded-lg bg-background/60 border border-border/40 text-foreground">
                                {q}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-border rounded-xl p-6">
                        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <h4 className="font-semibold text-sm">No lesson plan generated yet</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto mb-4">
                          Generate a grounded lesson plan incorporating {session.student?.name}&apos;s weak areas and previous debrief carries.
                        </p>
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleGeneratePlan}
                          isLoading={isPlanGenerating}
                          className="gap-1.5 text-xs shadow-emerald-950/40"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Generate AI Plan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Live Notes (Debounced) & Post-Session Debrief */}
              <div className="space-y-6">
                {/* Live Notes Editor */}
                <Card className="glass-panel border-border/80">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          Live Session Notes
                          {session.status !== "IN_PROGRESS" && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border">
                              <Lock className="w-2.5 h-2.5" /> Read-Only Locked
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {session.status === "IN_PROGRESS"
                            ? "Autosaved in real-time as you write during the lesson"
                            : "Session notes are locked once session completes."}
                        </CardDescription>
                      </div>

                      {/* Autosave Status Indicator */}
                      {session.status === "IN_PROGRESS" && (
                        <div className="text-[11px] font-medium flex items-center gap-1.5">
                          {saveStatus === "saving" && (
                            <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                            </span>
                          )}
                          {saveStatus === "saved" && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Saved {lastSavedAt}
                            </span>
                          )}
                          {saveStatus === "error" && (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Save failed
                            </span>
                          )}
                          {saveStatus === "idle" && (
                            <span className="text-muted-foreground">Autosave ready</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <Textarea
                      placeholder={
                        session.status === "IN_PROGRESS"
                          ? "Type informal observations, formulas covered, student breakthroughs, or concepts struggled with..."
                          : "No notes recorded."
                      }
                      value={notes}
                      onChange={handleNotesChange}
                      disabled={session.status !== "IN_PROGRESS"}
                      className={`min-h-[160px] text-xs leading-relaxed ${
                        session.status !== "IN_PROGRESS"
                          ? "bg-secondary/30 text-muted-foreground cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </CardContent>
                </Card>

                {/* AI Debrief Card */}
                {session.debrief && (
                  <Card className="glass-panel border-emerald-500/30 bg-emerald-500/5 animate-in fade-in">
                    <CardHeader className="pb-3 border-b border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mb-0.5">
                            <Sparkles className="w-3 h-3" /> Gemini 2.5 Flash Debrief
                          </div>
                          <CardTitle className="text-base font-bold text-foreground">
                            Post-Session Debrief & Homework
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateDebrief}
                          isLoading={isDebriefGenerating}
                          className="h-8 text-xs gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-emerald-400 block mb-1">Pedagogical Summary:</span>
                        <p className="text-muted-foreground leading-relaxed">{session.debrief.summary}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-background/60 border border-border/40">
                        <span className="font-bold text-foreground block mb-1.5">Assigned Homework:</span>
                        <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                          {session.debrief.homework.map((hw, i) => (
                            <li key={i} className="text-foreground">{hw}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        <span className="font-bold text-emerald-400 block mb-0.5">Next Session Focus:</span>
                        <p>{session.debrief.nextFocus}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
