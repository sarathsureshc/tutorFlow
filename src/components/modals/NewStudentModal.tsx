"use client";

import React, { useState } from "react";
import { Plus, X, User, Mail, BookOpen, GraduationCap, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: () => void;
}

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "Tutor_";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + "!";
}

export function NewStudentModal({ isOpen, onClose, onStudentCreated }: NewStudentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generateSecurePassword);
  const [subject, setSubject] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [weakAreas, setWeakAreas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          subject,
          currentLevel,
          learningGoals,
          weakAreas,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create student account.");
        setIsLoading(false);
        return;
      }

      onStudentCreated();
      onClose();
    } catch (err: any) {
      setError("An unexpected error occurred while creating student.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Onboard New Student
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create student credentials and pedagogical baseline profile.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3 text-primary" /> Full Name
              </label>
              <Input
                placeholder="e.g. Maya Lin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-primary" /> Email
              </label>
              <Input
                type="email"
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-medium text-muted-foreground flex items-center gap-1">
                Temporary Password (min. 8 characters)
              </label>
              <button
                type="button"
                onClick={() => setPassword(generateSecurePassword())}
                className="text-primary hover:underline text-[11px]"
              >
                Regenerate Secure Key
              </button>
            </div>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Provide this temporary password to your student so they can sign in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-primary" /> Subject
              </label>
              <Input
                placeholder="e.g. AP Calculus BC"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-muted-foreground flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-primary" /> Academic Level
              </label>
              <Input
                placeholder="e.g. Grade 12"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3 text-primary" /> Stated Learning Goals
            </label>
            <Textarea
              placeholder="e.g. Master Taylor series and polar curves to score a 5 on the AP Exam."
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" /> Persistent Weak Areas (Used for AI Context)
            </label>
            <Textarea
              placeholder="e.g. Struggles with Lagrange Error Bound and setting up parametric area integrals."
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm" isLoading={isLoading} loadingText="Creating...">
              Create Student Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
