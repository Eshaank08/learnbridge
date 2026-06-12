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
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-zinc-500 text-sm">Results for</p>
            <h2 className="text-white font-medium text-lg">"{query}"</h2>
          </div>
          {detectedLang && (
            <span className="ml-auto text-xs bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-1 rounded-full">
              Detected: {detectedLang}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Lesson cards */}
        {!loading && lessons.length > 0 && (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <div className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/7 hover:border-white/15 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-white/8 text-zinc-400 px-2 py-0.5 rounded-full">
                          {lesson.subject}
                        </span>
                        <span className="text-xs text-zinc-600 capitalize">
                          {lesson.level}
                        </span>
                      </div>
                      <h3 className="text-white font-medium text-base mb-1 group-hover:text-zinc-100">
                        {lesson.title}
                      </h3>
                      <p className="text-zinc-500 text-sm">
                        {lesson.teacher.flag} {lesson.teacher.name} ·{" "}
                        {lesson.teacher.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-zinc-600 text-xs">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-600">Sponsored by</p>
                        <p className="text-xs text-zinc-400 font-medium">
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
            <p className="text-zinc-500">No lessons found. Try a different query.</p>
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
