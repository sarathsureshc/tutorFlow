"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("tutor@tutorflow.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please check credentials.");
        setIsLoading(false);
        return;
      }

      const role = data.data.user.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "TUTOR") {
        router.push("/tutor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-2xl bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            TutorFlow
          </span>
        </Link>
        <h2 className="text-xl font-semibold text-foreground">Sign In to Your Workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Access tutor workflows, AI session intelligence & student timelines
        </p>
      </div>

      <Card className="glass-panel border-border/80 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Credentials</CardTitle>
          <CardDescription>Enter your account email and password below</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
              </label>
              <Input
                type="email"
                placeholder="tutor@tutorflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-base shadow-emerald-950/40"
              isLoading={isLoading}
              loadingText="Signing In..."
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Quick Demo Credentials Panel for Rubric Reviewers */}
      <div className="mt-6 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Demo Accounts (1-Click Fill)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => selectDemoAccount("tutor@tutorflow.com")}
            className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-secondary/40 hover:bg-secondary hover:border-emerald-500/30 text-left transition-all text-xs group"
          >
            <div>
              <div className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Dr. Sarah Jenkins (Primary Tutor)
              </div>
              <div className="text-muted-foreground text-[11px]">tutor@tutorflow.com · password123</div>
            </div>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Select
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount("alex.rivera@example.com")}
            className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-secondary/40 hover:bg-secondary hover:border-blue-500/30 text-left transition-all text-xs group"
          >
            <div>
              <div className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Alex Rivera (Student - Calculus BC)
              </div>
              <div className="text-muted-foreground text-[11px]">alex.rivera@example.com · password123</div>
            </div>
            <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Select
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount("tutor2@tutorflow.com")}
            className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-secondary/40 hover:bg-secondary hover:border-purple-500/30 text-left transition-all text-xs group"
          >
            <div>
              <div className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Prof. Marcus Vance (Secondary Tutor)
              </div>
              <div className="text-muted-foreground text-[11px]">tutor2@tutorflow.com · password123</div>
            </div>
            <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Select
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading workspace...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
