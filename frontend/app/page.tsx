"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Award, BookOpen, Globe, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const EXAMPLES = [
  "मुझे photosynthesis समझाओ",
  "Why does gravity work?",
  "Pythagorean theorem explain karo",
  "What caused World War 1?",
  "Qu'est-ce que l'ADN?",
];

export default function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    router.push(`/results?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-white font-medium text-sm">LearnBridge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/courses" className="text-zinc-500 hover:text-white text-sm transition-colors">Courses</Link>
          {user ? (
            <Link href="/dashboard" className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-zinc-500 hover:text-white text-sm transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors">
                Sign up free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 items-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-zinc-400">
              <Globe className="w-3 h-3" />
              Free in every language, everywhere
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight tracking-tight">
              Education shouldn't
              <br />
              <span className="text-zinc-400">depend on your postcode.</span>
            </h1>

            <p className="text-zinc-500 text-base max-w-md leading-relaxed">
              Expert-taught courses. In your language. Funded by sponsors so you never pay.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-full"
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you struggling with? Type in any language..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/7 transition-all text-sm"
                />
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="flex-1 bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-100 disabled:opacity-40 transition-all text-sm"
                >
                  {loading ? "Searching..." : "Find lessons →"}
                </button>
                <Link
                  href="/courses"
                  className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  Browse courses
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </form>
          </motion.div>

          {/* Examples */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className="text-xs text-zinc-600 bg-white/4 border border-white/8 rounded-full px-3 py-1.5 hover:text-zinc-300 hover:border-white/18 transition-all"
              >
                {ex}
              </button>
            ))}
          </motion.div>

          <p className="text-zinc-700 text-xs">No signup required to search.</p>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t border-white/5 px-6 py-8">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { icon: BookOpen, label: "Structured courses", desc: "Lectures, videos, papers, books" },
            { icon: Award, label: "Real certificates", desc: "Earn on completion" },
            { icon: Globe, label: "Any language", desc: "Claude understands all" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2">
              <f.icon className="w-4 h-4 text-zinc-500" />
              <p className="text-white text-sm font-medium">{f.label}</p>
              <p className="text-zinc-600 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
