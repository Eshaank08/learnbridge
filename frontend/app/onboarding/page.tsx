"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Check } from "lucide-react";

const SUBJECTS = [
  { id: "cs", label: "Computer Science", emoji: "💻" },
  { id: "biology", label: "Biology", emoji: "🧬" },
  { id: "math", label: "Mathematics", emoji: "📐" },
  { id: "physics", label: "Physics", emoji: "⚡" },
  { id: "history", label: "History", emoji: "📚" },
  { id: "chemistry", label: "Chemistry", emoji: "🧪" },
];

const GOALS = [
  { id: "exam", label: "Pass an exam" },
  { id: "career", label: "Switch careers" },
  { id: "curiosity", label: "Learn out of curiosity" },
  { id: "school", label: "Support school studies" },
  { id: "certificate", label: "Earn a certificate" },
];

const LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to this subject" },
  { id: "intermediate", label: "Intermediate", desc: "I know some basics" },
  { id: "advanced", label: "Advanced", desc: "Looking to go deeper" },
];

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25 },
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [lang, setLang] = useState("English");

  const steps = ["Interests", "Goal", "Level", "Language"];

  const toggle = (id: string) =>
    setSubjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const canNext = [
    subjects.length > 0,
    !!goal,
    !!level,
    !!lang,
  ][step];

  const finish = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lb_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.onboarded = true;
        u.preferences = { subjects, goal, level, lang };
        localStorage.setItem("lb_user", JSON.stringify(u));
      }
    }
    router.push("/courses");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step ? "bg-white w-6" : i < step ? "bg-white/60" : "bg-white/15"
                }`}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="subjects" {...slide}>
              <h1 className="text-2xl font-semibold text-white mb-2">
                What do you want to learn?
              </h1>
              <p className="text-zinc-500 text-sm mb-7">Pick everything that interests you.</p>
              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      subjects.includes(s.id)
                        ? "border-white/40 bg-white/8 text-white"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                    {subjects.includes(s.id) && (
                      <Check className="w-3.5 h-3.5 ml-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="goal" {...slide}>
              <h1 className="text-2xl font-semibold text-white mb-2">What's your goal?</h1>
              <p className="text-zinc-500 text-sm mb-7">We'll recommend the right courses.</p>
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                      goal === g.id
                        ? "border-white/40 bg-white/8 text-white"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {g.label}
                    {goal === g.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="level" {...slide}>
              <h1 className="text-2xl font-semibold text-white mb-2">What's your level?</h1>
              <p className="text-zinc-500 text-sm mb-7">Be honest — we'll start you in the right place.</p>
              <div className="space-y-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      level === l.id
                        ? "border-white/40 bg-white/8 text-white"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{l.label}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{l.desc}</p>
                    </div>
                    {level === l.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="lang" {...slide}>
              <h1 className="text-2xl font-semibold text-white mb-2">Preferred language?</h1>
              <p className="text-zinc-500 text-sm mb-7">LearnBridge works in any language — Claude handles the rest.</p>
              <div className="space-y-3">
                {["English", "Hindi", "Swahili", "German", "Portuguese", "Other"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                      lang === l
                        ? "border-white/40 bg-white/8 text-white"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {l}
                    {lang === l && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (step < 3 ? setStep(step + 1) : finish())}
            disabled={!canNext}
            className="flex-1 bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-100 disabled:opacity-30 transition-all text-sm"
          >
            {step === 3 ? "Start learning →" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
