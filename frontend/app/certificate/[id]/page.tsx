"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, ArrowLeft, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Course = {
  id: string;
  title: string;
  certificate_name: string;
  teacher: { name: string; institution: string };
  duration: string;
  total_hours: number;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-gray-900 text-sm">Your certificate</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative border border-gray-200 rounded-3xl p-10 text-center bg-white shadow-sm overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-6">
            <Award className="w-7 h-7" />
          </div>

          <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mb-2">
            Certificate of Completion
          </p>
          <p className="text-gray-500 text-sm mb-6">LearnBridge · {today}</p>

          <div className="w-16 h-px bg-gray-200 mx-auto mb-6" />

          <p className="text-gray-500 text-sm mb-2">This certifies that</p>
          <h2 className="text-gray-900 text-3xl font-semibold mb-6">
            {user?.name || user?.email?.split("@")[0] || "Student"}
          </h2>

          <p className="text-gray-500 text-sm mb-2">has successfully completed</p>
          <h3 className="text-gray-900 text-xl font-semibold mb-1">{course.certificate_name}</h3>
          <p className="text-gray-500 text-sm mb-8">
            {course.total_hours} hours · {course.duration}
          </p>

          <div className="w-16 h-px bg-gray-200 mx-auto mb-8" />

          <div className="flex items-center justify-center gap-16">
            <div className="text-center">
              <p className="text-gray-900 text-sm font-medium mb-0.5">{course.teacher.name}</p>
              <p className="text-gray-500 text-xs">Course Instructor</p>
              <p className="text-gray-400 text-xs">{course.teacher.institution}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-900 text-sm font-medium mb-0.5">LearnBridge</p>
              <p className="text-gray-500 text-xs">Education Platform</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">"{course.sponsor.tagline}"</p>
            <p className="text-xs text-gray-500 mt-1">This course was made free by {course.sponsor.name}</p>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-900 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
          <Link
            href="/courses"
            className="flex items-center gap-2 bg-white text-gray-900 font-medium px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
          >
            Explore more courses
          </Link>
        </div>
      </div>
    </div>
  );
}
