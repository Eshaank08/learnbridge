"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import TutorCard, { Tutor } from "@/components/tutors/TutorCard";

type Lesson = {
  id: string;
  title: string;
  subject: string;
  concept: string;
  level: string;
  duration: string;
  teacher: { name: string; country: string; flag: string; credentials: string };
  sponsor: { name: string; tagline: string };
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectedLang, setDetectedLang] = useState("");
  const [subject, setSubject] = useState("");
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    fetch("/tutors.json").then((r) => r.json()).then(setAllTutors).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((data) => {
        setLessons(data.lessons || []);
        setDetectedLang(data.detected_language || "");
        setSubject(data.subject || "");
      })
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [query]);

  // Tutors that teach the matched subject, online first.
  const matchedTutors = allTutors
    .filter((t) => !subject || t.subject === subject)
    .sort((a, b) => Number(b.online) - Number(a.online) || b.rating - a.rating)
    .slice(0, 2);
  const subjectOnlineCount = allTutors.filter((t) => t.subject === subject && t.online).length;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-gray-500 text-sm">Results for</p>
            <h2 className="text-gray-900 font-medium text-lg">"{query}"</h2>
          </div>
          {detectedLang && (
            <span className="ml-auto text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
              Detected: {detectedLang}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Lesson cards */}
        {!loading && lessons.length > 0 && (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/courses/${lesson.id}`}>
                <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">
                          {lesson.subject}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {lesson.level}
                        </span>
                      </div>
                      <h3 className="text-gray-900 font-medium text-base mb-1 group-hover:text-gray-700">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {lesson.teacher.flag} {lesson.teacher.name} ·{" "}
                        {lesson.teacher.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Sponsored by</p>
                        <p className="text-xs text-gray-900 font-medium">
                          {lesson.sponsor.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Live tutor match */}
        {!loading && matchedTutors.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <h3 className="text-gray-900 font-semibold text-base">Prefer to talk to a human?</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  {subjectOnlineCount > 0
                    ? `${subjectOnlineCount} ${subject} ${subjectOnlineCount === 1 ? "expert is" : "experts are"} online now and can take your question live.`
                    : `Experts in ${subject || "your subject"} — request a session and they'll join when online.`}
                </p>
              </div>
              <Link
                href={`/tutors${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors shrink-0"
              >
                See all tutors <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedTutors.map((t) => (
                <TutorCard key={t.id} tutor={t} compact />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && lessons.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No lessons found. Try a different query.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
