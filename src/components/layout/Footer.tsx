import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background/60 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-foreground">TutorFlow</span>
            <span>&copy; {new Date().getFullYear()} · All rights reserved.</span>
          </div>

          {/* Operational Status indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational · Supabase PostgreSQL + Gemini 2.5 Flash
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <a
              href="https://github.com/sarathsureshc/tutorFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
