"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Lightbulb, ChevronRight } from "lucide-react";

type Msg = { role: "user" | "ai"; content: string };

type Props = {
  courseTitle: string;
  lectureTitle: string;
  lectureSummary: string;
  open: boolean;
  onClose: () => void;
};

const STARTER_PROMPTS = [
  "Help me understand the main concept",
  "What should I focus on?",
  "Ask me a question to test myself",
  "What connects this to real life?",
];

export default function AISidebar({ courseTitle, lectureTitle, lectureSummary, open, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      content: `I'm your learning guide for "${lectureTitle}". I won't give you answers directly — instead I'll help you think through the material and find understanding yourself. What's on your mind?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setMessages((prev) => [...prev, {
        role: "ai",
        content: "Something went wrong. Try again.",
      }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-[#111111] border-l border-white/8 flex flex-col z-50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Learning Guide</p>
                <p className="text-zinc-600 text-xs">Socratic AI tutor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context pill */}
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-xs text-zinc-600 flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <span className="truncate">{lectureTitle}</span>
            </p>
          </div>

          {/* Messages */}
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
                  <div className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                    <Lightbulb className="w-2.5 h-2.5 text-amber-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white text-black rounded-tr-sm"
                      : "bg-white/5 text-zinc-300 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {thinking && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-2.5 h-2.5 text-amber-400" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Starter prompts (show when only intro message) */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 space-y-1.5">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="w-full text-left text-xs text-zinc-500 bg-white/4 hover:bg-white/7 border border-white/8 rounded-xl px-3 py-2.5 transition-colors hover:text-zinc-300"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/8">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-white/20 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-white text-xs placeholder:text-zinc-600 focus:outline-none"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || thinking}
                className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-700 mt-2 text-center">Guides you, doesn't give answers</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
