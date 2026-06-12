"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    router.push(`/results?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Logo / wordmark */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            LearnBridge
          </h1>
          <p className="text-zinc-400 text-base text-center max-w-sm leading-relaxed">
            Free, expert-taught education — in your language, on your terms.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you struggling with? Type in any language..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all text-base"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="mt-3 w-full bg-white text-black font-medium py-3.5 rounded-2xl hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading ? "Finding lessons..." : "Find lessons →"}
          </button>
        </form>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "मुझे photosynthesis समझाओ",
            "Why does gravity work?",
            "Pythagorean theorem explain karo",
            "What caused World War 1?",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="text-xs text-zinc-500 bg-white/5 border border-white/8 rounded-full px-3 py-1.5 hover:text-zinc-300 hover:border-white/20 transition-all"
            >
              {example}
            </button>
          ))}
        </div>

        <p className="text-zinc-600 text-xs">No signup required.</p>
      </div>
    </main>
  );
}
