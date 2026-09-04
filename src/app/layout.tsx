import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TutorFlow — AI-Powered 1:1 Tutoring Workflow Platform",
  description:
    "Empowering high-performing tutors with structured AI lesson planning, debriefs, real-time notes, and progress analytics.",
  keywords: ["tutoring", "AI lesson planner", "student progress", "session debrief", "tutor platform"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
