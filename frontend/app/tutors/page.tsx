"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import TutorCard, { Tutor } from "@/components/tutors/TutorCard";
import { Suspense } from "react";

function TutorsContent() {
  const { user } = useAuth();
  const params = useSearchParams();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filter, setFilter] = useState(params.get("subject") || "All");
  const [search, setSearch] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);

  useEffect(() => {
    fetch("/tutors.json").then((r) => r.json()).then(setTutors);
  }, []);

  const subjects = ["All", ...Array.from(new Set(tutors.map((t) => t.subject)))];
  const onlineCount = tutors.filter((t) => t.online).length;

  const filtered = useMemo(() => {
    return tutors
      .filter((t) => filter === "All" || t.subject === filter)
      .filter((t) => !onlineOnly || t.online)
      .filter((t) => {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.specialties.some((s) => s.toLowerCase().includes(q)) ||
          t.languages.some((l) => l.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => Number(b.online) - Number(a.online) || b.rating - a.rating);
  }, [tutors, filter, search, onlineOnly]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-gray-900 font-medium text-sm">LearnBridge</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/courses" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Courses</Link>
          {user ? (
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">My Learning</Link>
          ) : (
            <Link href="/auth/signup" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Sign up free</Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {onlineCount} expert tutors online right now
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Stuck on something? Talk to a human.</h1>
          <p className="text-gray-500 max-w-2xl">
            Describe your problem and get matched to a real expert who's online now — in your language, for free.
            When the AI guide isn't enough, a person is one click away.
          </p>
        </div>

        {/* AI match callout */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Let AI find the right tutor for you</p>
            <p className="text-gray-400 text-xs">Type your problem in any language — we match you to an available expert.</p>
          </div>
          <Link href="/results?q=" className="hidden sm:inline-flex bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            Describe my problem
          </Link>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, topic, or language..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all"
            />
          </div>
          <button
            onClick={() => setOnlineOnly((v) => !v)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
              onlineOnly ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900"
            }`}
          >
            ● Online now
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Tutor grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">No tutors match your filters.</div>
        )}

        <p className="text-xs text-gray-400 mt-10 text-center max-w-xl mx-auto">
          Live sessions are funded by course sponsors — free for students. Tutors earn per session, so one expert can help learners across the world.
        </p>
      </div>
    </div>
  );
}

export default function TutorsPage() {
  return (
    <Suspense>
      <TutorsContent />
    </Suspense>
  );
}
