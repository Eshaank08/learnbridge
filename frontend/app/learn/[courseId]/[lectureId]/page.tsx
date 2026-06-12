"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play, FileText, Book, ChevronRight, Check,
  ArrowLeft, Lightbulb, Clock, ExternalLink
} from "lucide-react";
import AISidebar from "@/components/sidebar/AISidebar";

type Material = { type: string; title: string; duration?: string; author?: string; url?: string; description?: string };
type Lecture = { id: string; order: number; title: string; duration: string; description: string; materials: Material[]; content_summary?: string };
type Course = {
  id: string; title: string; subject: string; certificate: boolean;
  teacher: { name: string; flag: string };
  lectures: Lecture[];
};

const MAT_ICON: Record<string, React.ElementType> = { video: Play, paper: FileText, book: Book };
const MAT_LABEL: Record<string, string> = { video: "Video", paper: "Research Paper", book: "Book / Chapter" };
const MAT_COLOR: Record<string, string> = {
  video: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  paper: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  book: "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

function getCompletedLectures(courseId: string): string[] {
  try { return JSON.parse(localStorage.getItem(`lb_progress_${courseId}`) || "[]"); }
  catch { return []; }
}

function markComplete(courseId: string, lectureId: string) {
  const done = getCompletedLectures(courseId);
  if (!done.includes(lectureId)) {
    localStorage.setItem(`lb_progress_${courseId}`, JSON.stringify([...done, lectureId]));
  }
}

export default function LearnPage() {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "video" | "paper" | "book">("all");

  useEffect(() => {
    fetch("/courses.json")
      .then((r) => r.json())
      .then((data: Course[]) => {
        const c = data.find((x) => x.id === courseId);
        if (!c) return;
        setCourse(c);
        const l = (c as any).lectures.find((x: Lecture) => x.id === lectureId);
        setLecture(l || null);
        setCompleted(getCompletedLectures(courseId));
      });
  }, [courseId, lectureId]);

  const markDone = () => {
    markComplete(courseId, lectureId);
    setCompleted(getCompletedLectures(courseId));
  };

  const isDone = completed.includes(lectureId);
  const allDone = course ? (course as any).lectures.every((l: Lecture) => completed.includes(l.id)) : false;

  const currentIndex = course ? (course as any).lectures.findIndex((l: Lecture) => l.id === lectureId) : -1;
  const nextLecture = course ? (course as any).lectures[currentIndex + 1] : null;
  const prevLecture = course ? (course as any).lectures[currentIndex - 1] : null;

  const filteredMaterials = lecture?.materials.filter(
    (m) => activeTab === "all" || m.type === activeTab
  ) || [];

  const lectureSummary = `This lecture "${lecture?.title}" covers: ${lecture?.description}`;

  if (!course || !lecture) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] transition-all ${sidebarOpen ? "pr-80" : ""}`}>
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-3.5 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-40">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${courseId}`} className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-600">
            <span className="truncate max-w-32">{course.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400 truncate max-w-32">{lecture.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-24 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${(completed.length / (course as any).lectures.length) * 100}%` }}
              />
            </div>
            <span>{completed.length}/{(course as any).lectures.length}</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sidebarOpen ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "bg-white/5 text-zinc-400 hover:text-white border border-white/8"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Learning Guide</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Lecture header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-zinc-600">Lecture {lecture.order}</span>
            {isDone && (
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Completed
              </span>
            )}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-white mb-2"
          >
            {lecture.title}
          </motion.h1>
          <p className="text-zinc-500 text-sm">{lecture.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-600">
            <Clock className="w-3 h-3" />
            <span>{lecture.duration}</span>
            <span>·</span>
            <span>{lecture.materials.length} resources</span>
          </div>
        </div>

        {/* Curriculum sidebar (left, course outline) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course outline */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <p className="text-xs text-zinc-600 mb-3 font-medium uppercase tracking-wider">Course outline</p>
            <div className="space-y-1">
              {(course as any).lectures.map((lec: Lecture) => {
                const isActive = lec.id === lectureId;
                const isDoneLec = completed.includes(lec.id);
                return (
                  <Link key={lec.id} href={`/learn/${courseId}/${lec.id}`}>
                    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive ? "bg-white/8 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/3"
                    }`}>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isDoneLec ? "border-emerald-400 bg-emerald-400/20" : isActive ? "border-white/40" : "border-white/15"
                      }`}>
                        {isDoneLec && <Check className="w-2 h-2 text-emerald-400" />}
                      </div>
                      <span className="leading-snug line-clamp-2">{lec.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Material type filter */}
            <div className="flex gap-2 mb-6">
              {(["all", "video", "paper", "book"] as const).map((t) => {
                const count = t === "all" ? lecture.materials.length : lecture.materials.filter((m) => m.type === t).length;
                if (count === 0 && t !== "all") return null;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      activeTab === t ? "bg-white text-black" : "bg-white/5 text-zinc-500 hover:text-zinc-300 border border-white/8"
                    }`}
                  >
                    {t === "all" ? "All" : MAT_LABEL[t]} {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Materials list */}
            <div className="space-y-4">
              {filteredMaterials.map((mat, i) => {
                const Icon = MAT_ICON[mat.type] || Play;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/5 hover:border-white/12 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${MAT_COLOR[mat.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-xs text-zinc-600 mb-1 block capitalize">{MAT_LABEL[mat.type] || mat.type}</span>
                            <h3 className="text-white text-sm font-medium leading-snug">{mat.title}</h3>
                            {mat.author && <p className="text-zinc-500 text-xs mt-0.5">{mat.author}</p>}
                          </div>
                          {mat.duration && (
                            <span className="text-xs text-zinc-600 shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{mat.duration}
                            </span>
                          )}
                        </div>
                        {mat.description && (
                          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">{mat.description}</p>
                        )}
                        {mat.url && (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 text-xs text-zinc-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {mat.type === "video" ? "Watch on YouTube" : mat.type === "paper" ? "Read paper" : "Access book"}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation + mark complete */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
              {prevLecture ? (
                <Link href={`/learn/${courseId}/${prevLecture.id}`} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{prevLecture.title}</span>
                  <span className="sm:hidden">Previous</span>
                </Link>
              ) : <div />}

              <div className="flex items-center gap-3">
                {!isDone && (
                  <button
                    onClick={markDone}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-400/20 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark complete
                  </button>
                )}
                {nextLecture ? (
                  <Link href={`/learn/${courseId}/${nextLecture.id}`} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  allDone && (
                    <Link href={`/certificate/${courseId}`} className="flex items-center gap-2 bg-amber-400 text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-300 transition-colors">
                      Get certificate 🎓
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      <AISidebar
        courseTitle={course.title}
        lectureTitle={lecture.title}
        lectureSummary={lectureSummary}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
