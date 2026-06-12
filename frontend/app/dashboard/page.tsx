"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Award, BookOpen, Clock, ChevronRight, LogOut, Search } from "lucide-react";

type Course = {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  level: string;
  duration: string;
  total_hours: number;
  certificate: boolean;
  lectures: { id: string }[];
  teacher: { name: string; flag: string };
  sponsor: { name: string };
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

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetch("/courses.json")
      .then((r) => r.json())
      .then((data: Course[]) => {
        setCourses(data);
        const e = data
          .filter((c) => !!localStorage.getItem(`lb_enrolled_${c.id}`))
          .map((c) => c.id);
        setEnrolled(e);
      });
  }, [user, router]);

  const getProgress = (course: Course) => {
    const done = JSON.parse(localStorage.getItem(`lb_progress_${course.id}`) || "[]");
    return { done: done.length, total: course.lectures.length };
  };

  const enrolledCourses = courses.filter((c) => enrolled.includes(c.id));
  const exploreCourses = courses.filter((c) => !enrolled.includes(c.id));

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) return null;

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
          <Link
            href="/courses"
            className="text-gray-500 hover:text-gray-900 text-sm transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Explore
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-semibold text-gray-900">
            {user.name || user.email.split("@")[0]}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Enrolled", value: enrolled.length, icon: BookOpen },
            {
              label: "Completed lectures",
              value: enrolledCourses.reduce((sum, c) => sum + getProgress(c).done, 0),
              icon: Clock,
            },
            {
              label: "Certificates",
              value: enrolledCourses.filter((c) => {
                const p = getProgress(c);
                return p.done === p.total && p.total > 0;
              }).length,
              icon: Award,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <stat.icon className="w-4 h-4 text-gray-500 mb-3" />
              <p className="text-2xl font-semibold text-gray-900 mb-0.5">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-gray-900 font-semibold mb-5">My courses</h2>
            <div className="space-y-4">
              {enrolledCourses.map((course, i) => {
                const { done, total } = getProgress(course);
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const isFinished = done === total && total > 0;
                const nextLec = course.lectures[done]?.id || course.lectures[0]?.id;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-5 hover:shadow-md hover:border-gray-300 transition-all"
                  >
                    <div className="text-3xl shrink-0">
                      {SUBJECT_EMOJI[course.subject] || "📖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-medium text-sm mb-0.5 truncate">
                        {course.title}
                      </h3>
                      <p className="text-gray-500 text-xs mb-3">
                        {course.teacher.flag} {course.teacher.name}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-900 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                    {isFinished ? (
                      <Link
                        href={`/certificate/${course.id}`}
                        className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors shrink-0"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Certificate
                      </Link>
                    ) : (
                      <Link
                        href={`/learn/${course.id}/${nextLec}`}
                        className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-medium px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shrink-0"
                      >
                        Continue
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explore */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-gray-900 font-semibold">Explore more</h2>
            <Link href="/courses" className="text-gray-500 hover:text-gray-900 text-xs transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {exploreCourses.slice(0, 3).map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/courses/${course.id}`}>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
                    <p className="text-2xl mb-3">{SUBJECT_EMOJI[course.subject] || "📖"}</p>
                    <p className="text-gray-900 text-sm font-medium mb-1 leading-snug">
                      {course.title}
                    </p>
                    <p className="text-gray-500 text-xs">{course.duration}</p>
                    {course.certificate && (
                      <p className="text-amber-600 text-xs mt-2 inline-flex items-center gap-1 font-medium">
                        <Award className="w-3 h-3" />
                        Certificate
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
