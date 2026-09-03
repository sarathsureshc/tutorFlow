"use client";

import React, { useState } from "react";
import { Sparkles, X, TrendingUp, CheckCircle, AlertCircle, Lightbulb, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIProgressSummaryResponse } from "@/types";

interface ProgressSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  subject: string;
}

export function ProgressSummaryModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  subject,
}: ProgressSummaryModalProps) {
  const [data, setData] = useState<{ analysis: AIProgressSummaryResponse; totalDebriefedSessions: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/progress-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to generate progress summary.");
        setIsLoading(false);
        return;
      }

      setData({
        analysis: json.data.analysis,
        totalDebriefedSessions: json.data.student.totalDebriefedSessions,
      });
      setIsLoading(false);
    } catch (err: any) {
      setError("An unexpected error occurred while generating summary.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3 h-3" /> Gemini 2.5 Flash Longitudinal Intelligence
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Multi-Session Progress Analysis
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student: <span className="font-semibold text-foreground">{studentName}</span> · Subject: <span className="text-primary font-medium">{subject}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!data && !isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Generate Longitudinal Progress Report</h4>
              <p className="text-xs text-muted-foreground max-w-sm mb-4">
                Gemini will synthesize all chronological debriefs for {studentName}, detecting learning velocity, mastered topics, persistent bottlenecks, and strategic teaching recommendations.
              </p>
              <Button onClick={handleGenerate} variant="gradient" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" /> Generate Progress Summary
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground animate-pulse">
                Synthesizing chronological session debriefs & evaluating learning trajectory...
              </p>
            </div>
          )}

          {data && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Trajectory Banner */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
                  <TrendingUp className="w-4 h-4" /> Trajectory Arc (Across {data.totalDebriefedSessions} Debriefed Sessions)
                </div>
                {data.analysis.trajectory}
              </div>

              {/* Mastered vs Persistent Struggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-border/80 bg-secondary/30">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Mastered Concepts
                  </h4>
                  <ul className="space-y-1.5">
                    {data.analysis.masteredConcepts.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-secondary/30">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2 text-amber-400">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Persistent Struggles
                  </h4>
                  <ul className="space-y-1.5">
                    {data.analysis.persistentStruggles.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Advice for Tutor */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-blue-400 mb-1">
                  <Lightbulb className="w-4 h-4" /> Actionable Advice for Tutor
                </div>
                {data.analysis.actionableAdviceForTutor}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          {data && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              isLoading={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate Analysis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
