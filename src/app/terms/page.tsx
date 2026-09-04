import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Platform Overview
        </Link>

        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/80 shadow-2xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <Scale className="w-3.5 h-3.5" /> Legal & Governance
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Terms and Conditions of Service</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Effective Date: September 2026 · Version 1.0 (EdTech Compliance)
            </p>
          </div>

          <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, scheduling sessions, or accessing TutorFlow (the &quot;Platform&quot;), tutors, students, and authorized guardians agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not access or use the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                2. User Roles & Account Security
              </h2>
              <p>
                TutorFlow operates a closed-loop multi-tenant architecture. Tutors are responsible for onboarding their students and maintaining the confidentiality of their credentials. Student accounts are created strictly by authenticated tutors; open public registration is disabled to prevent unauthorized data access.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                3. Tutoring Sessions & State Machine Rules
              </h2>
              <p>
                Every 1:1 tutoring session follows a strict server-side state machine: <strong className="text-foreground">SCHEDULED &rarr; IN_PROGRESS &rarr; COMPLETED &rarr; AI_REVIEWED</strong>. Tutors agree that once a session is marked COMPLETED or AI_REVIEWED, session notes are permanently locked to preserve instructional integrity and prevent retrospective tampering.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                4. Acceptable Use of AI Features
              </h2>
              <p>
                TutorFlow provides AI-assisted lesson planning, session debriefing, and longitudinal progress tracking powered by Google Gemini. AI outputs are pedagogical aids designed to augment, not replace, professional tutoring judgment. Tutors remain solely responsible for validating mathematical formulas, syllabus coverage, and homework assignments before delivery to students.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                5. Intellectual Property
              </h2>
              <p>
                Tutors retain full ownership of proprietary lesson notes, problem sets, and pedagogical materials created on the Platform. TutorFlow grants users a non-exclusive, revocable license to access the workflow tools for personal educational purposes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                6. Limitation of Liability
              </h2>
              <p>
                TutorFlow is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. In no event shall TutorFlow or its developers be liable for indirect, incidental, or consequential damages resulting from academic test scores, exam results, or service interruptions.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
