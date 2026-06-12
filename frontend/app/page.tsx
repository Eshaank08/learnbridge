import Link from "next/link";
import graphsJson from "../../seed-data/graphs.json";
import type { Graph } from "../lib/types";

const graphs = graphsJson as unknown as Graph[];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-amber-400">
            LearnBridge
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-50 mb-4">
          Learn anything as a{" "}
          <span className="text-amber-400">skill tree</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Learn anything as a skill tree — unlock topics, master them with
          AI-graded quizzes.
        </p>
      </section>

      {/* Roadmap grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-6">
          Choose a roadmap
        </h2>
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {graphs.map((graph) => (
            <Link
              key={graph.id}
              href={`/graph/${graph.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-800 bg-gray-900 p-6 transition-all duration-200 hover:border-amber-500/60 hover:bg-gray-800 hover:shadow-lg hover:shadow-amber-900/20"
            >
              {/* Subject pill */}
              <span className="self-start rounded-full bg-emerald-900/60 px-3 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-700/50">
                {graph.subject}
              </span>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">
                {graph.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed flex-1">
                {graph.description}
              </p>

              {/* Footer: node count */}
              <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <svg
                  className="w-3.5 h-3.5 text-amber-500/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                </svg>
                <span>{graph.nodes.length} topics</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
