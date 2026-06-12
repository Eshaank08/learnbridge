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
  beginner: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  intermediate: "text-amber-700 bg-amber-50 border border-amber-200",
  advanced: "text-red-700 bg-red-50 border border-red-200",
};

const SUBJECT_EMOJI: Record<string, string> = {
  "Computer Science": "💻",
  Biology: "🧬",
  Mathematics: "📐",
  Physics: "⚡",
  History: "📚",
  Chemistry: "🧪",
  Economics: "📈",
  "Data Science": "📊",
  Psychology: "🧠",
  Philosophy: "💭",
  "Environmental Science": "🌍",
  "Creative Writing": "✍️",
  "Public Health": "🩺",
  Business: "💼",
  "Art & Culture": "🎨",
  Languages: "🗣️",
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const subjects = ["All", ...Array.from(new Set(courses.map((c) => c.subject)))];

  useEffect(() => {
    fetch("/courses.json").then((r) => r.json()).then(setCourses);
  }, []);

  const filtered = courses.filter((c) => {
    const matchSubject = filter === "All" || c.subject === filter;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-gray-900 font-medium text-sm">LearnBridge</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
            >
              My Learning
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-500">Expert-taught. Sponsor-funded. Free for you.</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === s
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
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
                <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all h-full cursor-pointer">
                  {/* Subject + level */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{SUBJECT_EMOJI[course.subject] || "📖"}</span>
                    <span className="text-xs text-gray-500">{course.subject}</span>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        LEVEL_COLOR[course.level] || "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {course.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-gray-900 font-semibold text-lg mb-1 group-hover:text-gray-700 leading-snug">
                    {course.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
                    {course.subtitle}
                  </p>

                  {/* Teacher */}
                  <p className="text-xs text-gray-500 mb-4">
                    {course.teacher.flag} {course.teacher.name} · {course.teacher.institution}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lectures.length} lectures
                    </div>
                    {course.certificate && (
                      <div className="flex items-center gap-1.5 text-amber-600 text-xs ml-auto font-medium">
                        <Award className="w-3.5 h-3.5" />
                        Certificate
                      </div>
                    )}
                  </div>

                  {/* Sponsor */}
                  <p className="text-xs text-gray-400 mt-3">Free · Sponsored by {course.sponsor.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">No courses match your filter.</div>
        )}
      </div>
    </div>
  );
}
