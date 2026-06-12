"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Lightbulb, ChevronRight, BrainCircuit, CheckCircle2, Circle, RotateCcw } from "lucide-react";

type Msg = { role: "user" | "ai"; content: string; isQuestion?: boolean };
type QuizQ = { q: string; hint: string };
type QuizPhase = "idle" | "loading" | "asking" | "feedback" | "done";
type SidebarMode = "guide" | "quiz";

type Props = {
  courseTitle: string;
  lectureTitle: string;
  lectureSummary: string;
  lectureId?: string;
  open: boolean;
  onClose: () => void;
};

const STARTER_PROMPTS = [
  "Help me understand the main concept",
  "What should I focus on?",
  "Ask me a question to test myself",
  "What connects this to real life?",
];

export default function AISidebar({ courseTitle, lectureTitle, lectureSummary, lectureId, open, onClose }: Props) {
  const [mode, setMode] = useState<SidebarMode>("guide");

  // Guide state
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      content: `I'm your learning guide for "${lectureTitle}". I won't give you answers directly — instead I'll help you think through the material. What's on your mind?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("idle");
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [checkingAnswer, setCheckingAnswer] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset quiz when lecture changes
  useEffect(() => {
    setQuizPhase("idle");
    setQuestions([]);
    setQIdx(0);
    setScore(0);
  }, [lectureId]);

  const send = async (text?: string) => {
    const q = text || input.trim();
    if (!q || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setThinking(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          courseTitle,
          lectureTitle,
          lectureSummary,
          history: messages.slice(-6).map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Something went wrong. Try again." }]);
    } finally {
      setThinking(false);
    }
  };

  const startQuiz = async () => {
    setQuizPhase("loading");
    setScore(0);
    setQIdx(0);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", lectureTitle, lectureSummary }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setQuizPhase("asking");
      setUserAnswer("");
    } catch {
      setQuizPhase("idle");
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || checkingAnswer) return;
    setCheckingAnswer(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check",
          question: questions[qIdx].q,
          answer: userAnswer,
          lectureSummary,
        }),
      });
      const data = await res.json();
      setFeedbackText(data.feedback || "Good answer!");
      setCorrect(data.correct !== false);
      if (data.correct !== false) setScore((s) => s + 1);
      setQuizPhase("feedback");
    } catch {
      setFeedbackText("Couldn't evaluate — try moving on.");
      setQuizPhase("feedback");
    } finally {
      setCheckingAnswer(false);
    }
  };

  const nextQuestion = () => {
    if (qIdx + 1 >= questions.length) {
      setQuizPhase("done");
    } else {
      setQIdx((i) => i + 1);
      setUserAnswer("");
      setFeedbackText("");
      setQuizPhase("asking");
    }
  };

  const resetQuiz = () => {
    setQuizPhase("idle");
    setQuestions([]);
    setQIdx(0);
    setScore(0);
    setUserAnswer("");
    setFeedbackText("");
  };

  const currentQ = questions[qIdx];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col z-50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-gray-900 text-sm font-medium">AI Learning Tools</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setMode("guide")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
                mode === "guide"
                  ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Guide
            </button>
            <button
              onClick={() => setMode("quiz")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
                mode === "quiz"
                  ? "text-indigo-700 border-b-2 border-indigo-500 bg-indigo-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              Quiz me
            </button>
          </div>

          {/* Context pill */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <span className="truncate">{lectureTitle}</span>
            </p>
          </div>

          {/* ── GUIDE MODE ── */}
          {mode === "guide" && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                        <Lightbulb className="w-2.5 h-2.5 text-amber-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gray-900 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-700 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {thinking && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-2.5 h-2.5 text-amber-500" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {messages.length === 1 && (
                <div className="px-4 pb-3 space-y-1.5">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 transition-colors hover:text-gray-900"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-gray-400 transition-colors">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent text-gray-900 text-xs placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || thinking}
                    className="text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Guides you, doesn&apos;t give answers</p>
              </div>
            </>
          )}

          {/* ── QUIZ MODE ── */}
          {mode === "quiz" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* idle */}
              {quizPhase === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <BrainCircuit className="w-7 h-7 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-semibold mb-1.5">Test your understanding</p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      3 questions based on this lecture. Claude will give you feedback on each answer.
                    </p>
                  </div>
                  <button
                    onClick={startQuiz}
                    className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Start quiz →
                  </button>
                </div>
              )}

              {/* loading */}
              {quizPhase === "loading" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">Generating questions…</p>
                </div>
              )}

              {/* asking */}
              {quizPhase === "asking" && currentQ && (
                <div className="flex-1 flex flex-col px-4 py-4 gap-4 overflow-y-auto">
                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < qIdx ? "bg-indigo-500" : i === qIdx ? "bg-indigo-300" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Question {qIdx + 1} of {questions.length}</p>

                  {/* Question card — amber border like johannes "comprehension question" style */}
                  <div className="bg-white border border-gray-200 border-l-4 border-l-amber-400 rounded-xl px-4 py-4 shadow-sm">
                    <p className="text-xs font-semibold text-amber-600 mb-2">Check your understanding</p>
                    <p className="text-sm text-gray-900 leading-relaxed">{currentQ.q}</p>
                    {currentQ.hint && (
                      <p className="text-xs text-gray-400 mt-3 italic">Hint: {currentQ.hint}</p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 resize-none transition-all"
                    />
                    <button
                      onClick={submitAnswer}
                      disabled={!userAnswer.trim() || checkingAnswer}
                      className="w-full mt-2.5 bg-indigo-600 text-white text-xs font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {checkingAnswer ? "Checking…" : "Submit answer →"}
                    </button>
                  </div>
                </div>
              )}

              {/* feedback */}
              {quizPhase === "feedback" && currentQ && (
                <div className="flex-1 flex flex-col px-4 py-4 gap-4 overflow-y-auto">
                  <div className="flex items-center gap-1.5">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < qIdx ? "bg-indigo-500" : i === qIdx ? "bg-indigo-500" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* User answer */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <p className="text-xs text-gray-400 mb-1">Your answer</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{userAnswer}</p>
                  </div>

                  {/* AI feedback */}
                  <div className={`border rounded-xl px-4 py-3 ${
                    correct
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {correct
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        : <Circle className="w-3.5 h-3.5 text-amber-600" />
                      }
                      <p className={`text-xs font-semibold ${correct ? "text-emerald-700" : "text-amber-700"}`}>
                        {correct ? "Well done!" : "Keep working on it"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{feedbackText}</p>
                  </div>

                  <button
                    onClick={nextQuestion}
                    className="w-full mt-auto bg-indigo-600 text-white text-xs font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    {qIdx + 1 >= questions.length ? "See results →" : "Next question →"}
                  </button>
                </div>
              )}

              {/* done */}
              {quizPhase === "done" && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                    score === questions.length
                      ? "bg-emerald-50 border-emerald-200"
                      : score >= Math.ceil(questions.length / 2)
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-amber-50 border-amber-200"
                  }`}>
                    <span className="text-2xl font-bold text-gray-900">{score}/{questions.length}</span>
                  </div>

                  <div>
                    <p className="text-gray-900 text-sm font-semibold mb-1.5">
                      {score === questions.length
                        ? "Perfect score!"
                        : score >= Math.ceil(questions.length / 2)
                        ? "Good understanding"
                        : "Review this lecture"}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {score === questions.length
                        ? "You've got a strong grasp of this material. Move on confidently."
                        : score >= Math.ceil(questions.length / 2)
                        ? "Solid foundation. Re-read the sections where you hesitated."
                        : "Watch the video again and try the quiz once more."}
                    </p>
                  </div>

                  <button
                    onClick={resetQuiz}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
