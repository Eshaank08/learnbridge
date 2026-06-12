"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, ArrowRight, Globe, Award, BookOpen, Lightbulb, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { WordRotate } from "@/components/ui/word-rotate";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Marquee } from "@/components/ui/marquee";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";

const SUBJECTS = ["Biology", "Computer Science", "Mathematics", "Physics", "History", "Chemistry"];
const EXAMPLES = [
  "मुझे photosynthesis समझाओ",
  "Why does gravity work?",
  "Pythagorean theorem explain karo",
  "What caused World War 1?",
  "Qu'est-ce que l'ADN?",
];

const SPONSORS = ["Google", "Bayer", "SAP", "Deutsche Bank", "Siemens", "UNICEF", "McKinsey", "Bosch"];

const STEPS = [
  {
    n: "01",
    title: "Search in any language",
    desc: "Type what you're struggling with — in Hindi, Swahili, German, anything. Claude understands.",
    icon: Search,
  },
  {
    n: "02",
    title: "Get matched to the right lesson",
    desc: "AI detects your language, subject, and level. Surfaces the 3 most relevant expert lessons.",
    icon: Lightbulb,
  },
  {
    n: "03",
    title: "Learn with a Socratic AI guide",
    desc: "A sidebar tutor helps you think through the material — asks questions, gives hints, never just answers.",
    icon: BookOpen,
  },
  {
    n: "04",
    title: "Earn your certificate",
    desc: "Complete a course and get a shareable certificate. Real courses. Real credentials. No cost.",
    icon: Award,
  },
];

const COURSES_PREVIEW = [
  { subject: "💻", title: "Computer Science Fundamentals", teacher: "Prof. David Miller · MIT", duration: "8 weeks", cert: true },
  { subject: "🧬", title: "Biology: Life from Molecules to Ecosystems", teacher: "Dr. Amara Osei · University of Nairobi", duration: "6 weeks", cert: true },
  { subject: "📐", title: "Mathematics for Everyone", teacher: "Prof. Priya Sharma · IIT Bombay", duration: "10 weeks", cert: true },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    router.push(`/results?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">LearnBridge</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/courses" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Courses</Link>
          <Link href="/courses" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">How it works</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Sign up free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-6 pt-24 pb-20 max-w-5xl mx-auto text-center">
        <BlurFade delay={0}>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <AnimatedShinyText className="text-xs font-medium text-gray-600" shimmerWidth={80}>
              Free for every student, everywhere
            </AnimatedShinyText>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
        </BlurFade>

        <BlurFade delay={0.06}>
          <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Expert education in{" "}
            <WordRotate
              words={SUBJECTS}
              className="text-blue-600 inline-block"
              duration={2000}
            />
            <br />
            <span className="text-gray-400">free, in your language.</span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.12}>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Quality education is gatekept by geography, wealth, and language.
            <br />
            LearnBridge removes all three barriers at once.
          </p>
        </BlurFade>

        {/* Search bar */}
        <BlurFade delay={0.18}>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative flex items-center shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden focus-within:border-gray-400 focus-within:shadow-md transition-all">
              <Search className="absolute left-4 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you struggling with? Any language..."
                className="flex-1 py-4 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="m-1.5 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-all whitespace-nowrap"
              >
                {loading ? "Searching..." : "Find lessons"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setQuery(ex)}
                  className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-400 hover:text-gray-700 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </form>
        </BlurFade>

        <BlurFade delay={0.22}>
          <div className="flex items-center justify-center gap-6 mt-8">
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
              Browse courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-gray-200">|</span>
            <span className="text-sm text-gray-400">No signup required to search</span>
          </div>
        </BlurFade>
      </section>

      {/* ── STATS ── */}
      <BlurFade delay={0} inView>
        <section className="border-y border-gray-100 bg-gray-50 py-12 px-6">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: 50000, suffix: "+", label: "Students learning" },
              { value: 3, suffix: "", label: "Expert courses" },
              { value: 100, suffix: "%", label: "Free for students" },
              { value: 5, suffix: "+", label: "Languages supported" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-gray-900 mb-1">
                  <NumberTicker value={stat.value} className="text-3xl font-semibold text-gray-900" />
                  {stat.suffix}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </BlurFade>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <BlurFade inView>
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-semibold text-gray-900">From question to certificate — in four steps</h2>
          </div>
        </BlurFade>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <BlurFade key={step.n} delay={i * 0.08} inView>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
                <p className="text-xs font-mono text-gray-300 mb-4">{step.n}</p>
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <step.icon className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                {i === 0 && <BorderBeam size={60} duration={8} colorFrom="#3b82f6" colorTo="#8b5cf6" />}
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ── COURSES PREVIEW ── */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <BlurFade inView>
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-2">Courses</p>
                <h2 className="text-3xl font-semibold text-gray-900">Start learning today</h2>
              </div>
              <Link href="/courses" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COURSES_PREVIEW.map((c, i) => (
              <BlurFade key={c.title} delay={i * 0.08} inView>
                <Link href="/courses">
                  <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer overflow-hidden">
                    <p className="text-3xl mb-4">{c.subject}</p>
                    <h3 className="font-semibold text-gray-900 text-base mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-gray-500 text-xs mb-4">{c.teacher}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.duration}</span>
                      {c.cert && <span className="flex items-center gap-1 text-amber-500"><Award className="w-3 h-3" />Certificate</span>}
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                    <BorderBeam size={80} duration={10} colorFrom="#f59e0b" colorTo="#3b82f6" />
                  </div>
                </Link>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SIDEBAR FEATURE ── */}
      <BlurFade inView>
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-3">AI Learning Guide</p>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">A tutor that makes you think — not one that gives you the answer</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Every lesson comes with a Socratic AI guide. It doesn't solve your problems. Instead it asks you the right questions so you discover the answer yourself. That's how real learning sticks.
              </p>
              <div className="space-y-3">
                {[
                  "Available on every lecture, instantly",
                  "Anchored to the course material — no hallucinations",
                  "Guides you with hints, not answers",
                  "Works in your language",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            {/* Sidebar preview mockup */}
            <div className="relative">
              <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Learning Guide</span>
                  <span className="ml-auto text-xs text-gray-400">Socratic AI tutor</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { role: "ai", text: "I see you're studying photosynthesis. What do you already know about why plants need sunlight?" },
                    { role: "user", text: "I think they use it to make food?" },
                    { role: "ai", text: "Good instinct! What specific part of the plant do you think captures that sunlight?" },
                    { role: "user", text: "The leaves?" },
                    { role: "ai", text: "Right! And inside the leaves, there's a specific structure. Can you guess what it might be called?" },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <BorderBeam size={80} duration={8} colorFrom="#f59e0b" colorTo="#10b981" />
              </div>
            </div>
          </div>
        </section>
      </BlurFade>

      {/* ── SPONSOR MARQUEE ── */}
      <section className="py-14 border-y border-gray-100 bg-gray-50 overflow-hidden">
        <BlurFade inView>
          <p className="text-center text-xs text-gray-400 mb-6 uppercase tracking-widest">
            Courses funded by leading organizations
          </p>
        </BlurFade>
        <Marquee pauseOnHover className="[--gap:3rem] [--duration:25s]" repeat={3}>
          {SPONSORS.map((s) => (
            <div key={s} className="flex items-center justify-center px-8 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors select-none">
              {s}
            </div>
          ))}
        </Marquee>
      </section>

      {/* ── CTA ── */}
      <BlurFade inView>
        <section className="py-24 px-6 max-w-2xl mx-auto text-center">
          <div className="relative bg-gray-900 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 pointer-events-none" />
            <Globe className="w-8 h-8 text-white/40 mx-auto mb-6" />
            <h2 className="text-3xl font-semibold text-white mb-4">
              Education is a right.<br />Not a privilege.
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              A 14-year-old in rural Bihar deserves the same quality education as a student at an elite school.<br />
              LearnBridge is how we get there.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup" className="bg-white text-gray-900 font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                Start learning free →
              </Link>
              <Link href="/courses" className="bg-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/15 transition-colors text-sm border border-white/10">
                Browse courses
              </Link>
            </div>
            <BorderBeam size={100} duration={12} colorFrom="#3b82f6" colorTo="#8b5cf6" />
          </div>
        </section>
      </BlurFade>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-sm font-medium text-gray-700">LearnBridge</span>
          </div>
          <p className="text-xs text-gray-400">Free education for every student, everywhere. Built at Claude Builders Club Hackathon.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/courses" className="hover:text-gray-700 transition-colors">Courses</Link>
            <Link href="/auth/signup" className="hover:text-gray-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
