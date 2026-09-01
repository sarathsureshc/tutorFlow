"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut, User as UserIcon, BookOpen, Calendar, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isTutor = user?.role === "TUTOR";
  const isStudent = user?.role === "STUDENT";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href={isTutor ? "/tutor/dashboard" : isStudent ? "/student/dashboard" : "/login"} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg leading-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                TutorFlow
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                1:1 Tutoring Suite
              </span>
            </div>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {isTutor && (
                <>
                  <Link
                    href="/tutor/dashboard"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      pathname.startsWith("/tutor")
                        ? "bg-secondary text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    Students & Sessions
                  </Link>
                </>
              )}

              {isStudent && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      pathname.startsWith("/student")
                        ? "bg-secondary text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    My Learning Hub
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="font-semibold text-foreground">{user.name}</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTutor ? "bg-emerald-400" : "bg-blue-400"}`} />
                  {user.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="gradient">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
