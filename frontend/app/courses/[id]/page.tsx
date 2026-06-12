"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, Award, BookOpen, Play, FileText, Book,
  ChevronRight, ArrowLeft, Check, Users
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Material = { type: string; title: string; duration?: string; author?: string; url?: string; description?: string };
type Lecture = { id: string; order: number; title: string; duration: string; description: string; materials: Material[] };
type Course = {
  id: string; title: string; subtitle: string; subject: string; level: string;
  duration: string; total_hours: number; certificate: boolean; certificate_name: string;
  description: string; what_you_learn: string[];
  teacher: { name: string; institution: string; flag: string; bio: string };
  sponsor: { name: string; tagline: string };
  lectures: Lecture[];
};

const MAT_ICON: Record<string, React.ElementType> = {
  video: Play, paper: FileText, book: Book
};
const MAT_COLOR: Record<string, string> = {
  video: "text-blue-400 bg-blue-400/10",
  paper: "text-purple-400 bg-purple-400/10",
  book: "text-amber-400 bg-amber-400/10",
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [expanded, setExpanded] = useState<string | null>("lec-1");
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetch("/courses.json")
      .then((r) => r.json())
      .then((data: Course[]) => setCourse(data.find((c) => c.id === id) || null));
    const key = `lb_enrolled_${id}`;
    setEnrolled(!!localStorage.getItem(key));
  }, [id]);

  const enroll = () => {
    if (!user) { router.push("/auth/signup"); return; }
    localStorage.setItem(`lb_enrolled_${id}`, "1");
    setEnrolled(true);
    router.push(`/learn/${id}/${course?.lectures[0]?.id}`);
  };

  const totalMaterials = course?.lectures.reduce((sum, l) => sum + l.materials.length, 0) || 0;

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Link href="/courses" className="text-zinc-500 hover:text-white text-sm transition-colors">Courses</Link>
        <ChevronRight className="w-3 h-3 text-zinc-700" />
        <span className="text-zinc-400 text-sm truncate">{course.title}</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: course info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full">{course.subject}</span>
              <span className="text-xs text-zinc-500 capitalize">{course.level}</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold text-white mb-3 leading-tight"
            >
              {course.title}
            </motion.h1>
            <p className="text-zinc-400 text-base mb-6 leading-relaxed">{course.description}</p>

            {/* Teacher */}
            <div className="flex items-center gap-3 mb-8 p-4 bg-white/3 border border-white/8 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                {course.teacher.flag}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{course.teacher.name}</p>
                <p className="text-zinc-500 text-xs">{course.teacher.institution}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{course.teacher.bio}</p>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="mb-8">
              <h2 className="text-white font-semibold mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.what_you_learn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap / Curriculum */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Course Roadmap</h2>
                <span className="text-xs text-zinc-600">{course.lectures.length} lectures · {totalMaterials} materials</span>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-px bg-white/8" />

                <div className="space-y-3">
                  {course.lectures.map((lec) => (
                    <div key={lec.id} className="relative pl-10">
                      {/* Node */}
                      <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-white/20 bg-[#0a0a0a]" />

                      <div
                        className={`border rounded-xl overflow-hidden transition-all ${
                          expanded === lec.id ? "border-white/15 bg-white/4" : "border-white/8 bg-white/2"
                        }`}
                      >
                        <button
                          onClick={() => setExpanded(expanded === lec.id ? null : lec.id)}
                          className="w-full p-4 flex items-center gap-3 text-left"
                        >
                          <span className="text-xs text-zinc-600 w-5 shrink-0">
                            {String(lec.order).padStart(2, "0")}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">{lec.title}</p>
                            <p className="text-zinc-600 text-xs mt-0.5">{lec.description}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-zinc-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{lec.duration}
                            </span>
                            <span className="text-xs text-zinc-700">
                              {lec.materials.length} items
                            </span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-zinc-600 transition-transform ${
                                expanded === lec.id ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {expanded === lec.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4 space-y-2 border-t border-white/5"
                          >
                            <div className="pt-3 space-y-2">
                              {lec.materials.map((mat, mi) => {
                                const Icon = MAT_ICON[mat.type] || BookOpen;
                                return (
                                  <div key={mi} className="flex items-start gap-3 py-2">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${MAT_COLOR[mat.type]}`}>
                                      <Icon className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-zinc-300 text-xs font-medium leading-snug">{mat.title}</p>
                                      {mat.author && <p className="text-zinc-600 text-xs">{mat.author}</p>}
                                      {mat.description && <p className="text-zinc-600 text-xs mt-0.5 leading-relaxed">{mat.description}</p>}
                                    </div>
                                    {mat.duration && (
                                      <span className="text-xs text-zinc-700 shrink-0">{mat.duration}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: enroll card (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white/4 border border-white/10 rounded-2xl p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span>{course.duration} · {course.total_hours} hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <BookOpen className="w-4 h-4 text-zinc-500" />
                  <span>{course.lectures.length} lectures · {totalMaterials} resources</span>
                </div>
                {course.certificate && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <Award className="w-4 h-4" />
                    <span>Certificate on completion</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Users className="w-4 h-4" />
                  <span>Free · Sponsored by {course.sponsor.name}</span>
                </div>
              </div>

              <button
                onClick={enroll}
                className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${
                  enrolled
                    ? "bg-white/10 text-zinc-300 hover:bg-white/15"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                {enrolled ? "Continue learning →" : "Enroll for free →"}
              </button>

              {course.certificate && (
                <div className="mt-4 p-3 bg-amber-400/5 border border-amber-400/15 rounded-xl">
                  <p className="text-xs text-amber-400 font-medium mb-1">Certificate included</p>
                  <p className="text-xs text-zinc-500">{course.certificate_name}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-600 italic">
                  "{course.sponsor.tagline}"
                </p>
                <p className="text-xs text-zinc-700 mt-1">— {course.sponsor.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
