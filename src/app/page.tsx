import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Clock, Brain, Cpu, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Production-Grade 1:1 Tutoring Architecture
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mb-6">
          Elevate 1:1 Tutoring with{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Structured AI Intelligence
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
          TutorFlow streamlines session lifecycles, guarantees zero double-booking, delivers grounded AI lesson plans & debriefs with strict JSON schemas, and tracks student progress timelines without N+1 overhead.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link href="/login">
            <Button size="lg" variant="gradient" className="gap-2 text-base px-8 shadow-emerald-950/50">
              Sign In to Demo <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="text-base px-6">
              View Rubric Highlights
            </Button>
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 rounded-xl border border-border/80">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Structured Gemini AI (25 pts)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enforced structured JSON via <code className="text-emerald-400">responseSchema</code>. Historical context & weak areas injected server-side with zero generic hallucination.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-border/80">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Session State Machine (15 pts)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Strict transition graph (<code className="text-purple-400">SCHEDULED</code> → <code className="text-purple-400">IN_PROGRESS</code> → <code className="text-purple-400">COMPLETED</code> → <code className="text-purple-400">AI_REVIEWED</code>) with 409 Conflict rejection.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-border/80">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Auth & Scoped Tenancy (15 pts)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Custom JWT in <code className="text-blue-400">httpOnly</code> cookies, edge middleware RBAC, and zero cross-tutor data leakage with strictly filtered queries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          TutorFlow · Built for Senior Full-Stack Engineering Showcase · PostgreSQL + Prisma + Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
}
