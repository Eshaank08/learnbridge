"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, ArrowLeft, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Course = {
  id: string; title: string; certificate_name: string;
  teacher: { name: string; institution: string };
  duration: string; total_hours: number;
  sponsor: { name: string; tagline: string };
};

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    fetch("/courses.json")
      .then((r) => r.json())
      .then((data: Course[]) => setCourse(data.find((c) => c.id === id) || null));
  }, [id]);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-zinc-400 text-sm">Your certificate</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Certificate card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", damping: 20 }}
            className="relative bg-gradient-to-br from-[#1a1600] via-[#0d0d0d] to-[#001a0a] border border-amber-400/25 rounded-3xl p-10 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-emerald-400/5 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Logo area */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
              </div>

              <p className="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-2">Certificate of Completion</p>
              <p className="text-zinc-400 text-sm mb-6">LearnBridge · {today}</p>

              <div className="w-16 h-px bg-amber-400/30 mx-auto mb-6" />

              <p className="text-zinc-400 text-sm mb-2">This certifies that</p>
              <h2 className="text-white text-3xl font-semibold mb-6">
                {user?.name || user?.email?.split("@")[0] || "Student"}
              </h2>

              <p className="text-zinc-400 text-sm mb-2">has successfully completed</p>
              <h3 className="text-white text-xl font-semibold mb-1">{course.certificate_name}</h3>
              <p className="text-zinc-500 text-sm mb-8">{course.total_hours} hours · {course.duration}</p>

              <div className="w-16 h-px bg-white/10 mx-auto mb-8" />

              {/* Signatures */}
              <div className="flex items-center justify-center gap-16">
                <div className="text-center">
                  <p className="text-white text-sm font-medium mb-0.5">{course.teacher.name}</p>
                  <p className="text-zinc-600 text-xs">Course Instructor</p>
                  <p className="text-zinc-700 text-xs">{course.teacher.institution}</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-medium mb-0.5">LearnBridge</p>
                  <p className="text-zinc-600 text-xs">Education Platform</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/8">
                <p className="text-zinc-700 text-xs italic">
                  "{course.sponsor.tagline}"
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  This course was made free by {course.sponsor.name}
                </p>
              </div>

              {/* Certificate ID */}
              <p className="text-zinc-800 text-xs mt-4 font-mono">
                CERT-{id.toUpperCase()}-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white text-black font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Save as PDF
            </button>
            <Link
              href="/courses"
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-zinc-300 font-medium px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Explore more courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
