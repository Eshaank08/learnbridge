"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, ArrowRight, Globe, Award, BookOpen, Lightbulb, ChevronRight, WifiOff, Download, Smartphone, Check, Languages, Mic, Volume2, GraduationCap, Building2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Marquee } from "@/components/ui/marquee";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";

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
  { id: "cs-fundamentals", subject: "💻", title: "Computer Science Fundamentals", teacher: "Prof. David Miller · MIT", duration: "8 weeks", cert: true },
  { id: "biology-foundations", subject: "🧬", title: "Biology: From Cells to Ecosystems", teacher: "Dr. Amara Osei · University of Nairobi", duration: "6 weeks", cert: true },
  { id: "math-foundations", subject: "📐", title: "Mathematics for Everyone", teacher: "Prof. Priya Sharma · IIT Bombay", duration: "10 weeks", cert: true },
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
          <Link href="/tutors" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Live tutors</Link>
          <Link href="/teach" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Teach</Link>
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
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">any subject</span>
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
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
            {[
              { value: 1200, suffix: "+", label: "Students learning" },
              { value: 20, suffix: "+", label: "Expert courses" },
              { value: 95, suffix: "+", label: "Languages supported" },
              { value: 12, suffix: "", label: "Live tutors" },
              { value: 100, suffix: "%", label: "Free for students" },
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

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <BlurFade inView>
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-3">The problem</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">Talent is universal.<br />Access isn't.</h2>
          </div>
        </BlurFade>
        <BlurFade delay={0.1} inView>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            A brilliant student in rural Bihar, Lagos, or Jakarta hits the same three walls. We tear down all three.
          </p>
        </BlurFade>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { wall: "Geography", stat: "300M", label: "children can't read at grade level", desc: "One teacher, 80 students, no way to get individual help." },
            { wall: "Wealth", stat: "$0", label: "is what most families can spend", desc: "Quality tutoring and courses are priced for the few." },
            { wall: "Language", stat: "17%", label: "of the world speaks English natively", desc: "72% of online learning content is in English they can't read." },
          ].map((w, i) => (
            <BlurFade key={w.wall} delay={i * 0.1} inView>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{w.wall}</p>
                <p className="text-4xl font-semibold text-gray-900 mb-1">{w.stat}</p>
                <p className="text-sm text-gray-600 mb-3">{w.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{w.desc}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

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

      {/* ── MULTILINGUAL ENGINE ── */}
      <section className="py-24 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <BlurFade inView>
            <div className="text-center mb-4">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-3">The multilingual engine</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
                A teacher in Berlin. A student in Nairobi.<br />Same lesson — in their language.
              </h2>
            </div>
          </BlurFade>
          <BlurFade delay={0.1} inView>
            <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14">
              Language breaks education in three places. We solve all three — two already work, one is the 90-day pipeline.
            </p>
          </BlurFade>

          {/* Three problems */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {[
              {
                n: "Problem 1", icon: Search, title: "The input",
                desc: "Students can't express confusion in English. They think in Hindi, Swahili, Arabic.",
                how: "Claude reads intent directly in 95+ languages — no translation step.",
                status: "Working today", live: true,
              },
              {
                n: "Problem 2", icon: Languages, title: "The content",
                desc: "The teacher recorded in German. The student in Kenya can't understand a word.",
                how: "Auto-dub pipeline: transcribe → translate → clone the teacher's voice → lip-sync.",
                status: "90-day pipeline", live: false,
              },
              {
                n: "Problem 3", icon: Lightbulb, title: "The explanation",
                desc: "Even a great AI tutor is useless if it answers in a language the student can't read.",
                how: "The Socratic tutor replies in the student's own language, automatically.",
                status: "Working today", live: true,
              },
            ].map((p, i) => (
              <BlurFade key={p.n} delay={i * 0.1} inView>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                      <p.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      p.live ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {p.live ? "✓ " : ""}{p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{p.n} · {p.title}</p>
                  <p className="text-sm text-gray-700 font-medium mb-3 leading-snug">{p.desc}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-auto">{p.how}</p>
                </div>
              </BlurFade>
            ))}
          </div>

          {/* The content pipeline */}
          <BlurFade delay={0.1} inView>
            <div className="bg-gray-900 rounded-2xl p-8">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-2 text-center">The content pipeline — Problem 2</p>
              <p className="text-gray-400 text-sm text-center mb-8 max-w-xl mx-auto">
                Every tool below exists and is commercially available today. Nobody has assembled them for education at this price point.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {[
                  { icon: Mic, label: "Teacher records once", sub: "any language" },
                  { icon: BookOpen, label: "Whisper transcribes", sub: "speech → text" },
                  { icon: Languages, label: "Claude translates", sub: "40+ languages" },
                  { icon: Volume2, label: "ElevenLabs clones voice", sub: "their teacher's voice" },
                  { icon: Globe, label: "Same lesson, every language", sub: "infinite reach" },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 w-32 text-center">
                      <step.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                      <p className="text-white text-xs font-medium leading-tight">{step.label}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">{step.sub}</p>
                    </div>
                    {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-gray-600 shrink-0 hidden sm:block" />}
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
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
                <Link href={`/courses/${c.id}`}>
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

      {/* ── OFFLINE / ANYWHERE ── */}
      <section className="py-24 px-6 bg-gray-900 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Device mockup */}
          <BlurFade inView>
            <div className="relative flex justify-center">
              <div className="relative w-60 rounded-[2.2rem] border-[6px] border-gray-700 bg-gray-950 shadow-2xl overflow-hidden">
                {/* notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-gray-700 z-10" />
                <div className="pt-7 pb-5 px-3.5 space-y-2.5">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-white text-xs font-medium">My downloads</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400"><WifiOff className="w-2.5 h-2.5" /> Offline</span>
                  </div>
                  {[
                    { e: "💻", t: "Computer Science", s: "84 MB" },
                    { e: "🧬", t: "Biology", s: "62 MB" },
                    { e: "📐", t: "Mathematics", s: "71 MB" },
                  ].map((c) => (
                    <div key={c.t} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-2">
                      <span className="text-base">{c.e}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[11px] font-medium truncate">{c.t}</p>
                        <p className="text-gray-500 text-[9px]">{c.s} · Downloaded</p>
                      </div>
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    </div>
                  ))}
                  {/* offline tutor pill */}
                  <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl px-2.5 py-2 flex items-center gap-2 mt-3">
                    <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                    <p className="text-amber-300 text-[10px] leading-tight">AI tutor running on-device — no internet needed</p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Copy */}
          <BlurFade delay={0.1} inView>
            <div>
              <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">Learn anywhere</p>
              <h2 className="text-3xl font-semibold text-white mb-4 leading-tight">
                Download once. Learn offline.<br />Even the AI tutor.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Half the world's students don't have reliable internet. So LearnBridge is built as an app you can carry: download any course — videos, readings, certificate — and the on-device AI tutor keeps helping you, with no connection at all.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: Download, text: "Every course downloadable for offline use" },
                  { icon: WifiOff, text: "Socratic AI tutor runs locally — works with zero internet" },
                  { icon: Smartphone, text: "One free app, distributable to anyone, anywhere on Earth" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-gray-300" />
                    </div>
                    {f.text}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
                  <Smartphone className="w-4 h-4" /> iOS · Android · Web
                </span>
                <Link href="/courses" className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4" /> Try a download
                </Link>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── BUSINESS MODEL ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <BlurFade inView>
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-3">How it stays free</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">Sponsored education.<br />Not charity — strategy.</h2>
          </div>
        </BlurFade>
        <BlurFade delay={0.1} inView>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12">
            Three actors, one loop. A company funds a course as brand-building in a market it wants to enter — not as a donation. The student never pays.
          </p>
        </BlurFade>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: GraduationCap, role: "Student", give: "Their attention", get: "Expert lessons in their language, matched to their exact confusion — free.", accent: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { icon: BookOpen, role: "Teacher", give: "One recording", get: "Paid per lesson watched. Record once, reach millions across languages.", accent: "text-blue-600 bg-blue-50 border-blue-200" },
            { icon: Building2, role: "Sponsor", give: "CSR / brand budget", get: "Measurable reach to future customers, by region and language. Meets CSR mandates.", accent: "text-violet-600 bg-violet-50 border-violet-200" },
          ].map((a, i) => (
            <BlurFade key={a.role} delay={i * 0.1} inView>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${a.accent}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{a.role}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gives</p>
                <p className="text-sm text-gray-700 mb-3">{a.give}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gets</p>
                <p className="text-sm text-gray-600 leading-relaxed">{a.get}</p>
              </div>
            </BlurFade>
          ))}
        </div>
        <BlurFade delay={0.2} inView>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { stat: "$4B+", label: "global edtech CSR spend per year" },
              { stat: "78%", label: "of top Indian firms already fund digital education" },
              { stat: "2%", label: "of net profit — India's legally mandated CSR spend" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-2xl font-semibold text-gray-900">{s.stat}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </BlurFade>
      </section>

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
            <Link href="/tutors" className="hover:text-gray-700 transition-colors">Live tutors</Link>
            <Link href="/teach" className="hover:text-gray-700 transition-colors">Teach</Link>
            <Link href="/auth/signup" className="hover:text-gray-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
