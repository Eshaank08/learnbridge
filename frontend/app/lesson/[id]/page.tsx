"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Send } from "lucide-react";

type Message = { role: "user" | "ai"; content: string };

type Lesson = {
  id: string;
  title: string;
  subject: string;
  concept: string;
  level: string;
  duration: string;
  content_summary: string;
  teacher: { name: string; country: string; flag: string; credentials: string };
  sponsor: { name: string; tagline: string; logo_placeholder: string };
};

// Mock lessons for demo — replace with API call when backend is ready
const MOCK_LESSONS: Record<string, Lesson> = {
  "bio-001": {
    id: "bio-001",
    title: "Photosynthesis Explained",
    subject: "Biology",
    concept: "Photosynthesis",
    level: "beginner",
    duration: "8 min",
    content_summary:
      "Plants make their own food through a process called photosynthesis. They use sunlight, water from the soil, and carbon dioxide from the air. Inside plant cells are structures called chloroplasts, which contain a green pigment called chlorophyll. Chlorophyll captures light energy from the sun. The plant uses this energy to convert water and carbon dioxide into glucose — a type of sugar the plant uses for energy and growth. Oxygen is released as a byproduct, which is what we breathe. Without sunlight, plants cannot produce glucose and eventually die. This is why sunlight is essential to plant life.",
    teacher: {
      name: "Dr. Amara Osei",
      country: "Kenya",
      flag: "🇰🇪",
      credentials: "PhD Botany, University of Nairobi",
    },
    sponsor: {
      name: "Bayer",
      logo_placeholder: "bayer",
      tagline: "Investing in the scientists of tomorrow.",
    },
  },
};

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use mock until backend is ready
    const found = MOCK_LESSONS[id];
    if (found) setLesson(found);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || thinking || !lesson) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setThinking(true);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg,
          lesson_id: lesson.id,
          lesson_summary: lesson.content_summary,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer || "I can only help with questions about this lesson." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-500">Loading lesson...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>

        {/* Sponsor bar */}
        <div className="flex items-center justify-between mb-4 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
          <p className="text-xs text-zinc-500">
            This lesson is free thanks to{" "}
            <span className="text-zinc-300 font-medium">{lesson.sponsor.name}</span>
          </p>
          <p className="text-xs text-zinc-600 italic">{lesson.sponsor.tagline}</p>
        </div>

        {/* Lesson header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-white/8 text-zinc-400 px-2 py-0.5 rounded-full">
              {lesson.subject}
            </span>
            <span className="text-xs text-zinc-600 capitalize">{lesson.level}</span>
            <span className="text-xs text-zinc-600">· {lesson.duration}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">{lesson.title}</h1>
          <p className="text-zinc-500 text-sm">
            {lesson.teacher.flag} {lesson.teacher.name} · {lesson.teacher.credentials}
          </p>
        </div>

        {/* Video placeholder */}
        <div className="w-full aspect-video bg-white/5 border border-white/8 rounded-2xl flex flex-col items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent" />
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 hover:bg-white/15 cursor-pointer transition-colors">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
          <p className="text-zinc-500 text-sm">Video lesson</p>
          <p className="text-zinc-700 text-xs mt-1">{lesson.duration}</p>
        </div>

        {/* Q&A section */}
        <div className="border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-white text-sm font-medium">Ask a follow-up</p>
            <p className="text-zinc-600 text-xs">Claude answers based on this lesson</p>
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white text-black"
                        : "bg-white/5 text-zinc-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Still confused about something?"
              className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
