import Link from "next/link";
import { Sparkles, Home, ArrowLeft, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10 glass-panel p-8 sm:p-10 rounded-3xl border border-border/80 shadow-2xl">
        {/* Animated Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-primary shadow-lg shadow-emerald-500/10 animate-bounce">
          <Compass className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-foreground mt-3 tracking-tight">
            Lesson Plan Not Found
          </h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            The page or tutoring session you are looking for has been moved, archived, or does not exist in the curriculum.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="gradient" size="sm" className="w-full gap-2 text-xs">
              <Home className="w-3.5 h-3.5" /> Return to Portal
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-border/80 hover:bg-secondary">
              <BookOpen className="w-3.5 h-3.5" /> Platform Home
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>TutorFlow — 1:1 Tutoring Workflow Suite</span>
        </div>
      </div>
    </div>
  );
}
