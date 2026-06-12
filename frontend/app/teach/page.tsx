"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, DollarSign, BookOpen, Globe, TrendingUp, Upload,
  CheckCircle2, ArrowRight, Sparkles, Star, PlayCircle,
} from "lucide-react";

const STEPS = [
  { icon: Upload, title: "Apply & record once", desc: "Submit your credentials and a sample lesson. Record your course a single time." },
  { icon: Globe, title: "We translate & dub", desc: "AI dubs your lesson into 40+ languages, so a student in Nairobi or Mumbai learns in their own tongue." },
  { icon: Users, title: "Reach millions, get paid", desc: "Sponsors fund your course. You earn per lesson created — one recording, infinite global reach." },
];

const TEACHER_COURSES = [
  { title: "Computer Science Fundamentals", students: 48210, rating: 4.9, earnings: 3850, status: "Live" },
  { title: "Intro to Algorithms", students: 21640, rating: 4.8, earnings: 1720, status: "Live" },
  { title: "Discrete Mathematics", students: 0, rating: 0, earnings: 0, status: "In review" },
];

const STAT = (label: string, value: string, icon: React.ElementType) => ({ label, value, icon });

export default function TeachPage() {
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", credentials: "" });

  const stats = [
    STAT("Total students", "69,850", Users),
    STAT("This month", "+4,120", TrendingUp),
    STAT("Avg. rating", "4.9", Star),
    STAT("Earnings (USD)", "$5,570", DollarSign),
  ];

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
          <Link href="/courses" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
            Browse courses
          </Link>
          <a href="#apply" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Become a teacher
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Teach once. Reach the world.
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mb-4 max-w-3xl mx-auto">
          Your knowledge, in every language, for every student on Earth.
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Record a course once. We dub it into 40+ languages and put it in front of students who can't afford a classroom. Sponsors pay — students never do.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="#apply" className="bg-gray-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
            Start teaching <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#dashboard" className="text-gray-600 font-medium px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> See the dashboard
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-gray-50 border border-gray-200 rounded-2xl p-6"
            >
              <span className="absolute top-5 right-5 text-xs text-gray-300 font-semibold">0{i + 1}</span>
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1.5">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sample dashboard */}
      <section id="dashboard" className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Your teaching dashboard</p>
          <h2 className="text-2xl font-semibold text-gray-900">A real look at what you'd see</h2>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <s.icon className="w-4 h-4 text-gray-400 mb-3" />
              <p className="text-2xl font-semibold text-gray-900 mb-0.5">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Course table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
            <div className="col-span-5">Course</div>
            <div className="col-span-2 text-right">Students</div>
            <div className="col-span-2 text-right">Rating</div>
            <div className="col-span-2 text-right">Earnings</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          {TEACHER_COURSES.map((c) => (
            <div key={c.title} className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-100 last:border-0 items-center text-sm">
              <div className="col-span-5 font-medium text-gray-900 truncate">{c.title}</div>
              <div className="col-span-2 text-right text-gray-600">{c.students ? c.students.toLocaleString() : "—"}</div>
              <div className="col-span-2 text-right text-gray-600">{c.rating ? `★ ${c.rating}` : "—"}</div>
              <div className="col-span-2 text-right text-gray-900 font-medium">{c.earnings ? `$${c.earnings.toLocaleString()}` : "—"}</div>
              <div className="col-span-1 text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.status === "Live" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Earnings are funded entirely by course sponsors. Students always learn for free.</p>
      </section>

      {/* Apply form */}
      <section id="apply" className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
          {applied ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Application received{form.name ? `, ${form.name.split(" ")[0]}` : ""}!</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Our team reviews applications within 48 hours. Approved teachers get a dashboard to upload lessons and start reaching students worldwide.
              </p>
              <Link href="/courses" className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-gray-900 hover:underline">
                Browse the platform while you wait <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-gray-900" />
                <h3 className="text-xl font-semibold text-gray-900">Apply to teach</h3>
              </div>
              <p className="text-gray-500 text-sm mb-6">Free to join. We handle translation, hosting, and sponsor funding — you bring the expertise.</p>
              <form
                onSubmit={(e) => { e.preventDefault(); setApplied(true); }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block font-medium">Full name</label>
                  <input
                    required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Amara Osei"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block font-medium">Subject you teach</label>
                  <input
                    required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Biology, Calculus, Web Development..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block font-medium">Credentials & experience</label>
                  <textarea
                    required value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                    rows={3}
                    placeholder="PhD in Botany, University of Nairobi. 12 years teaching..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm">
                  Submit application →
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
