"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception safely to client telemetry
    console.error("TutorFlow App Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center space-y-6 glass-panel p-8 sm:p-10 rounded-3xl border border-destructive/30 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive shadow-lg shadow-destructive/10">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-destructive bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
            Runtime Exception
          </span>
          <h1 className="text-2xl font-extrabold text-foreground mt-3 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            An unexpected error occurred while processing this operation. Your session notes and database records remain safely preserved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </Button>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs border-border/80 hover:bg-secondary"
            >
              <Home className="w-3.5 h-3.5" /> Return to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
