"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, WifiOff, Loader2 } from "lucide-react";

type Phase = "idle" | "downloading" | "done";

/**
 * Mockup download button — simulates downloading a course for offline use.
 * No real file is saved; it demonstrates that courses + the on-device AI tutor
 * are available without an internet connection.
 */
export default function DownloadButton({
  label = "Download for offline",
  className = "",
  sizeMB = 84,
}: {
  label?: string;
  className?: string;
  sizeMB?: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = () => {
    if (phase !== "idle") return;
    setPhase("downloading");
    setPct(0);
    // Fake progress in a few uneven steps so it feels real.
    [12, 30, 48, 67, 81, 93, 100].forEach((p, i) => {
      timers.current.push(setTimeout(() => setPct(p), 220 + i * 260));
    });
    timers.current.push(setTimeout(() => setPhase("done"), 220 + 7 * 260 + 200));
  };

  return (
    <button
      onClick={start}
      disabled={phase !== "idle"}
      className={`relative w-full overflow-hidden rounded-xl border text-sm font-medium transition-all ${
        phase === "done"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50"
      } ${className}`}
    >
      {/* progress fill */}
      {phase === "downloading" && (
        <span
          className="absolute inset-y-0 left-0 bg-gray-100 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      )}

      <span className="relative flex items-center justify-center gap-2 py-2.5 px-4">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "idle" && (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {label}
              <span className="text-gray-400 font-normal">· {sizeMB} MB</span>
            </motion.span>
          )}
          {phase === "downloading" && (
            <motion.span key="dl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-gray-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading… {pct}%
            </motion.span>
          )}
          {phase === "done" && (
            <motion.span key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Available offline
              <WifiOff className="w-3.5 h-3.5 opacity-60" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
