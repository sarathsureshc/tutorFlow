"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, BookOpen, User, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { StudentProfileDTO } from "@/types";

export default function NewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMins, setDurationMins] = useState("60");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success) setUser(meData.data.user);

        const res = await fetch(`/api/students/${studentId}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data.profile);
        }

        // Set default time to tomorrow at 10:00 AM local
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        const localISO = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setScheduledAt(localISO);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };

    fetchInitial();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          topic,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMins: parseInt(durationMins, 10),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to schedule session.");
        setIsLoading(false);
        return;
      }

      // Redirect directly to the newly created session room
      router.push(`/tutor/sessions/${data.data.id}`);
    } catch (err: any) {
      setError("An unexpected network error occurred while scheduling.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-2xl">
        <Link
          href={`/tutor/students/${studentId}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Profile
        </Link>

        <Card className="glass-panel border-border/80 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 w-fit">
              <Calendar className="w-3 h-3" /> Indexed Collision Prevention
            </div>
            <CardTitle className="text-xl font-bold">Schedule New Tutoring Session</CardTitle>
            <CardDescription className="text-xs">
              {profile ? (
                <>
                  Student: <span className="font-semibold text-foreground">{profile.user.name}</span> ({profile.subject})
                </>
              ) : (
                "Configure session parameters and timestamp"
              )}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 text-xs">
              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> Conflict Error
                  </div>
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" /> Session Topic / Curricular Focus
                </label>
                <Input
                  placeholder="e.g. Lagrange Error Bound & Taylor Series Approximations"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Date & Start Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Duration (Minutes)
                  </label>
                  <select
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes (Standard)</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>
              </div>

              {profile && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1 text-muted-foreground">
                  <div className="font-semibold text-foreground text-[11px]">Context Injected by AI:</div>
                  <p>• Goals: {profile.learningGoals.slice(0, 100)}...</p>
                  <p>• Weak Areas: {profile.weakAreas.slice(0, 100)}...</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between">
              <Link href={`/tutor/students/${studentId}`}>
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="gradient" size="sm" isLoading={isLoading} loadingText="Scheduling...">
                Confirm & Create Session
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
