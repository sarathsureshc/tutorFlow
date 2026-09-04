import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Data Protection & Privacy
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy & Student Data Charter</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Effective Date: September 2026 · Compliant with DPDP Act & Global Student Privacy Standards
            </p>
          </div>

          <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                1. Our Commitment to Student Privacy
              </h2>
              <p>
                TutorFlow is built specifically for education. We believe student educational data is deeply personal. We never sell, rent, or monetize student profiles, academic weak areas, or session notes to third-party data brokers or advertisers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                2. Information We Collect
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li><strong className="text-foreground">Authentication Data:</strong> Name, email address, role, and securely bcrypt-hashed passwords.</li>
                <li><strong className="text-foreground">Student Academic Profiles:</strong> Subject, current grade level, stated learning goals, and pedagogical weak areas provided by the tutor.</li>
                <li><strong className="text-foreground">Session Records:</strong> Scheduled timestamps, duration, topics, live tutor notes, and homework assignments.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                3. Artificial Intelligence & Data Usage
              </h2>
              <p>
                TutorFlow utilizes Google Gemini AI solely to generate structured pre-session lesson plans, post-session debriefs, and longitudinal progress summaries.
              </p>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/50 text-foreground space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero AI Model Training
                </div>
                <p className="text-xs text-muted-foreground">
                  Student notes and learning profiles sent via the Gemini API are processed in a stateless session and are <strong>NEVER used to train foundational AI models</strong>.
                </p>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                4. Cookies & Token Storage
              </h2>
              <p>
                TutorFlow uses single-purpose session cookies (<code className="bg-secondary px-1.5 py-0.5 rounded text-primary">tutorflow_token</code>) signed with HMAC-SHA256. Cookies are flagged as <strong className="text-foreground">HttpOnly</strong>, <strong className="text-foreground">Secure</strong>, and <strong className="text-foreground">SameSite=Lax</strong>, making them structurally inaccessible to client-side scripts and third-party trackers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                5. Multi-Tenant Data Isolation
              </h2>
              <p>
                Our database architecture enforces query-layer tenant scoping. Tutor A structurally cannot query, see, or modify Tutor B&apos;s students or sessions. Students have strictly read-only access to their own assigned homework and debriefs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                6. Data Retention & Erasure Rights
              </h2>
              <p>
                Users may request complete account and data deletion at any time by contacting their tutor or platform administrator. Upon deletion, all associated sessions, lesson plans, debriefs, and profiles are permanently purged.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
