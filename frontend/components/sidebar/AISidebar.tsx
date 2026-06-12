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
          className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col z-50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-gray-900 text-sm font-medium">Learning Guide</p>
                <p className="text-gray-400 text-xs">Socratic AI tutor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context pill */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1">
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

          {/* Starter prompts (show when only intro message) */}
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

          {/* Input */}
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
            <p className="text-xs text-gray-400 mt-2 text-center">Guides you, doesn't give answers</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
