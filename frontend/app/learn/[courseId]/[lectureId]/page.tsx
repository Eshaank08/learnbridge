"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play, FileText, Book, ChevronRight, Check,
  ArrowLeft, Lightbulb, Clock, ExternalLink, Search, Target
} from "lucide-react";
import AIPanel from "@/components/sidebar/AIPanel";
import AISidebar from "@/components/sidebar/AISidebar";

type Material = { type: string; title: string; duration?: string; author?: string; url?: string; description?: string; youtube_id?: string };
type Lecture = { id: string; order: number; title: string; duration: string; description: string; materials: Material[] };
type Course = {
  id: string; title: string; subject: string; certificate: boolean;
  teacher: { name: string; flag: string };
  lectures: Lecture[];
  what_you_learn: string[];
};

const MAT_ICON: Record<string, React.ElementType> = { video: Play, paper: FileText, book: Book };
const MAT_LABEL: Record<string, string> = { video: "Video", paper: "Research Paper", book: "Book / Chapter" };
const MAT_COLOR: Record<string, string> = {
  video: "bg-blue-50 text-blue-600 border-blue-200",
  paper: "bg-purple-50 text-purple-600 border-purple-200",
  book: "bg-amber-50 text-amber-600 border-amber-200",
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "video" | "paper" | "book">("all");
  const [activeVideo, setActiveVideo] = useState<Material | null>(null);
  const [topicSearch, setTopicSearch] = useState("");
  const [topicSearchFocused, setTopicSearchFocused] = useState(false);

  useEffect(() => {
    fetch("/courses.json")
      .then((r) => r.json())
      .then((data: Course[]) => {
        const c = data.find((x) => x.id === courseId);
        if (!c) return;
        setCourse(c);
        const l = c.lectures.find((x: Lecture) => x.id === lectureId);
        setLecture(l || null);
        setActiveVideo(l?.materials.find((m) => m.type === "video" && m.youtube_id) || null);
        setCompleted(getCompletedLectures(courseId));
      });
  }, [courseId, lectureId]);

  const markDone = () => {
    markComplete(courseId, lectureId);
    setCompleted(getCompletedLectures(courseId));
  };

  const isDone = completed.includes(lectureId);
  const allDone = course ? course.lectures.every((l: Lecture) => completed.includes(l.id)) : false;
  const currentIndex = course ? course.lectures.findIndex((l: Lecture) => l.id === lectureId) : -1;
  const nextLecture = course ? course.lectures[currentIndex + 1] : null;
  const prevLecture = course ? course.lectures[currentIndex - 1] : null;
  const filteredMaterials = lecture?.materials.filter((m) => activeTab === "all" || m.type === activeTab) || [];
  const lectureSummary = `This lecture "${lecture?.title}" covers: ${lecture?.description}`;

  const scoreLecture = (lec: Lecture, query: string): number => {
    if (!query.trim()) return 0;
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const haystack = (lec.title + " " + lec.description).toLowerCase();
    return words.filter((w) => haystack.includes(w)).length;
  };

  const bestTopicMatch = topicSearch.trim() && course
    ? course.lectures.reduce(
        (best, lec) => {
          const s = scoreLecture(lec, topicSearch);
          return s > best.score ? { lec, score: s } : best;
        },
        { lec: null as Lecture | null, score: 0 }
      )
    : { lec: null, score: 0 };

  const aiPanelProps = {
    courseTitle: course?.title || "",
    lectureTitle: lecture?.title || "",
    lectureSummary,
    whatYouLearn: course?.what_you_learn || [],
    lectureId,
  };

  if (!course || !lecture) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-3.5 flex items-center justify-between bg-white/95 backdrop-blur z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${courseId}`} className="text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <span className="truncate max-w-32">{course.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 truncate max-w-32">{lecture.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(completed.length / course.lectures.length) * 100}%` }}
              />
            </div>
            <span>{completed.length}/{course.lectures.length}</span>
          </div>

          {/* Mobile-only: toggle AI sidebar */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            AI Guide
          </button>
        </div>
      </nav>

      {/* Body: content + permanent AI panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Lecture header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400">Lecture {lecture.order}</span>
                {isDone && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Completed
                  </span>
                )}
              </div>
              <motion.h1
                key={lectureId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-semibold text-gray-900 mb-2"
              >
                {lecture.title}
              </motion.h1>
              <p className="text-gray-500 text-sm">{lecture.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{lecture.duration}</span>
                <span>·</span>
                <span>{lecture.materials.length} resources</span>
              </div>
            </div>

            {/* Video player */}
            {activeVideo?.youtube_id && (
              <motion.div key={activeVideo.youtube_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black" style={{ aspectRatio: "16 / 9" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideo.youtube_id}`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900">{activeVideo.title}</p>
                  {activeVideo.description && <p className="text-xs text-gray-500 mt-0.5">{activeVideo.description}</p>}
                </div>
              </motion.div>
            )}

            {/* Outline + materials — two column on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Course outline */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Course outline</p>

                {/* Find a topic */}
                <div className="mb-3">
                  <div className={`flex items-center gap-2 border rounded-xl px-2.5 py-2 transition-all ${topicSearchFocused ? "border-indigo-300 ring-1 ring-indigo-100" : "border-gray-200"} bg-gray-50`}>
                    <Search className="w-3 h-3 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      onFocus={() => setTopicSearchFocused(true)}
                      onBlur={() => setTopicSearchFocused(false)}
                      placeholder="Find a topic..."
                      className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none"
                    />
                    {topicSearch && (
                      <button onClick={() => setTopicSearch("")} className="text-gray-300 hover:text-gray-600 shrink-0 text-xs">✕</button>
                    )}
                  </div>
                  {bestTopicMatch.lec && bestTopicMatch.score > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <p className="text-xs text-indigo-500 font-medium mb-0.5 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Best match
                      </p>
                      <Link href={`/learn/${courseId}/${bestTopicMatch.lec.id}`}>
                        <p className="text-xs text-indigo-800 font-medium hover:underline leading-snug">
                          Ch {bestTopicMatch.lec.order}: {bestTopicMatch.lec.title}
                        </p>
                      </Link>
                      <p className="text-xs text-indigo-500 mt-0.5">{bestTopicMatch.lec.duration}</p>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1">
                  {course.lectures.map((lec: Lecture) => {
                    const isActive = lec.id === lectureId;
                    const isDoneLec = completed.includes(lec.id);
                    const isMatch = bestTopicMatch.lec?.id === lec.id && bestTopicMatch.score > 0;
                    return (
                      <Link key={lec.id} href={`/learn/${courseId}/${lec.id}`}>
                        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive ? "bg-gray-100 text-gray-900" : isMatch ? "bg-indigo-50 text-indigo-800 border border-indigo-200" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isDoneLec ? "border-emerald-500 bg-emerald-50" : isActive ? "border-gray-400" : isMatch ? "border-indigo-300" : "border-gray-300"
                          }`}>
                            {isDoneLec && <Check className="w-2 h-2 text-emerald-600" />}
                          </div>
                          <span className="leading-snug line-clamp-2 flex-1">{lec.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Learning outcomes */}
                {course.what_you_learn?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-400 mb-2.5 font-medium uppercase tracking-wider">Learning goals</p>
                    <div className="space-y-1.5">
                      {course.what_you_learn.slice(0, 6).map((item, i) => {
                        const threshold = Math.ceil((i + 1) * (course.lectures.length / Math.min(course.what_you_learn.length, 6)));
                        const achieved = completed.length >= threshold;
                        return (
                          <div key={i} className={`flex items-start gap-2 text-xs transition-all ${achieved ? "text-gray-500" : "text-gray-400"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${achieved ? "border-emerald-400 bg-emerald-50" : "border-gray-300"}`}>
                              {achieved && <Check className="w-2 h-2 text-emerald-500" />}
                            </div>
                            <span className={`leading-snug ${achieved ? "line-through" : ""}`}>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Materials */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <div className="flex gap-2 mb-6">
                  {(["all", "video", "paper", "book"] as const).map((t) => {
                    const count = t === "all" ? lecture.materials.length : lecture.materials.filter((m) => m.type === t).length;
                    if (count === 0 && t !== "all") return null;
                    return (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${activeTab === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"}`}
                      >
                        {t === "all" ? "All" : MAT_LABEL[t]}{count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {filteredMaterials.map((mat, i) => {
                    const Icon = MAT_ICON[mat.type] || Play;
                    const isPlaying = mat.youtube_id && activeVideo?.youtube_id === mat.youtube_id;
                    const isPlayable = mat.type === "video" && mat.youtube_id;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => { if (isPlayable) { setActiveVideo(mat); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                        className={`bg-white border rounded-2xl p-5 transition-all ${isPlaying ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"} ${isPlayable ? "cursor-pointer" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${MAT_COLOR[mat.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-xs text-gray-400 mb-1 block capitalize">{MAT_LABEL[mat.type] || mat.type}</span>
                                <h3 className="text-gray-900 text-sm font-medium leading-snug">{mat.title}</h3>
                                {mat.author && <p className="text-gray-500 text-xs mt-0.5">{mat.author}</p>}
                              </div>
                              {mat.duration && (
                                <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{mat.duration}
                                </span>
                              )}
                            </div>
                            {mat.description && <p className="text-gray-500 text-xs mt-2 leading-relaxed">{mat.description}</p>}
                            {isPlayable ? (
                              <span className={`inline-flex items-center gap-1.5 mt-3 text-xs font-medium ${isPlaying ? "text-blue-600" : "text-gray-600"}`}>
                                <Play className="w-3 h-3" />{isPlaying ? "Now playing" : "Play here"}
                              </span>
                            ) : mat.url ? (
                              <a href={mat.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 mt-3 text-xs text-gray-600 hover:text-gray-900 transition-colors">
                                <ExternalLink className="w-3 h-3" />{mat.type === "paper" ? "Read paper" : "Access book"}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation + mark complete */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
                  {prevLecture ? (
                    <Link href={`/learn/${courseId}/${prevLecture.id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">{prevLecture.title}</span>
                      <span className="sm:hidden">Previous</span>
                    </Link>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    {!isDone && (
                      <button onClick={markDone} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Mark complete
                      </button>
                    )}
                    {nextLecture ? (
                      <Link href={`/learn/${courseId}/${nextLecture.id}`} className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors">
                        Next <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      allDone && (
                        <Link href={`/certificate/${courseId}`} className="flex items-center gap-2 bg-amber-400 text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-300 transition-colors">
                          Get certificate 🎓
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── PERMANENT AI PANEL (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-gray-200 shrink-0 bg-white">
          <div className="px-4 py-3.5 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-gray-900 text-sm font-medium">AI Learning Tools</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <AIPanel {...aiPanelProps} />
          </div>
        </aside>
      </div>

      {/* Mobile slide-over */}
      <AISidebar
        {...aiPanelProps}
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
    </div>
  );
}
