"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Calendar, Clock, BookOpen, Sparkles, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { SessionDTO } from "@/types";

interface SessionTimelineItemProps {
  session: SessionDTO;
  isLast?: boolean;
}

export function SessionTimelineItem({ session, isLast = false }: SessionTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative pl-6 pb-6 group">
      {/* Timeline connector line */}
      {!isLast && (
        <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-border group-hover:bg-primary/40 transition-colors" />
      )}

      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center transition-all ${
        session.status === "IN_PROGRESS"
          ? "border-amber-500 text-amber-500 scale-110 shadow-lg shadow-amber-500/20"
          : session.status === "AI_REVIEWED"
          ? "border-emerald-500 text-emerald-500"
          : session.status === "COMPLETED"
          ? "border-purple-500 text-purple-500"
          : "border-blue-500 text-blue-500"
      }`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 hover:border-border/80 transition-all">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={session.status} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(session.scheduledAt)} ({session.durationMins} mins)
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">{session.topic}</h4>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/tutor/sessions/${session.id}`}>
              <Button size="sm" variant={session.status === "IN_PROGRESS" ? "gradient" : "outline"} className="h-8 text-xs gap-1.5">
                {session.status === "IN_PROGRESS" ? (
                  <>
                    <Play className="w-3 h-3 fill-current" /> Resume Live
                  </>
                ) : session.status === "SCHEDULED" ? (
                  <>
                    <BookOpen className="w-3 h-3" /> Prepare Session
                  </>
                ) : (
                  <>
                    View Details <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </Button>
            </Link>

            {(session.plan || session.debrief || session.notes) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible details preview */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-3 text-xs animate-in fade-in">
            {session.notes && (
              <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50">
                <span className="font-semibold text-muted-foreground block mb-0.5">Session Notes:</span>
                <p className="text-foreground italic">{session.notes}</p>
              </div>
            )}

            {session.debrief && (
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <div className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Debrief Summary
                </div>
                <p className="text-xs leading-relaxed mb-2">{session.debrief.summary}</p>
                <div className="font-semibold text-foreground text-[11px] mb-0.5">Assigned Homework:</div>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {session.debrief.homework.map((hw, i) => (
                    <li key={i}>{hw}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-emerald-400 font-medium">
                  <strong>Next Focus:</strong> {session.debrief.nextFocus}
                </div>
              </div>
            )}

            {session.plan && (
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300">
                <div className="font-bold text-blue-400 flex items-center gap-1 mb-1">
                  <BookOpen className="w-3.5 h-3.5" /> AI Lesson Plan Objectives
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                  {session.plan.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
