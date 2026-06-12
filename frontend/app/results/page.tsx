"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";

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
      })
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [query]);

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
