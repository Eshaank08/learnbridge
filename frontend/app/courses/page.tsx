"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Award, BookOpen, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Course = {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  level: string;
  duration: string;
  total_hours: number;
  certificate: boolean;
  teacher: { name: string; institution: string; flag: string };
  sponsor: { name: string };
  lectures: { id: string }[];
};

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-amber-400 bg-amber-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

const SUBJECT_EMOJI: Record<string, string> = {
  "Computer Science": "💻",
  Biology: "🧬",
  Mathematics: "📐",
  Physics: "⚡",
  History: "📚",
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const subjects = ["All", "Computer Science", "Biology", "Mathematics", "Physics", "History"];

  useEffect(() => {
    fetch("/courses.json").then((r) => r.json()).then(setCourses);
  }, []);

  const filtered = courses.filter((c) => {
    const matchSubject = filter === "All" || c.subject === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-white font-medium text-sm">LearnBridge</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
              My Learning
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-zinc-400 hover:text-white text-sm transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors">Sign up free</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-2">Courses</h1>
          <p className="text-zinc-500">Expert-taught. Sponsor-funded. Free for you.</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-white/5 border border-white/8 rounded-xl py-2.5 pl-9 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 text-sm transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === s
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/8"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <Link href={`/courses/${course.id}`}>
                <div className="group bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/5 hover:border-white/15 transition-all h-full cursor-pointer">
                  {/* Subject + level */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{SUBJECT_EMOJI[course.subject] || "📖"}</span>
                    <span className="text-xs text-zinc-500">{course.subject}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium capitalize ${LEVEL_COLOR[course.level]}`}>
                      {course.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-white font-semibold text-lg mb-1 group-hover:text-zinc-100 leading-snug">
                    {course.title}
                  </h2>
                  <p className="text-zinc-500 text-sm mb-4 leading-relaxed line-clamp-2">
                    {course.subtitle}
                  </p>

                  {/* Teacher */}
                  <p className="text-xs text-zinc-600 mb-4">
                    {course.teacher.flag} {course.teacher.name} · {course.teacher.institution}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lectures.length} lectures
                    </div>
                    {course.certificate && (
                      <div className="flex items-center gap-1.5 text-amber-500 text-xs ml-auto">
                        <Award className="w-3.5 h-3.5" />
                        Certificate
                      </div>
                    )}
                  </div>

                  {/* Sponsor */}
                  <p className="text-xs text-zinc-700 mt-3">
                    Free · Sponsored by {course.sponsor.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-600">No courses match your filter.</div>
        )}
      </div>
    </div>
  );
}
