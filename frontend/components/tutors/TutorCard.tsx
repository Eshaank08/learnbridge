"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Globe, Video, Check, Loader2 } from "lucide-react";

export type Tutor = {
  id: string;
  name: string;
  avatar: string;
  flag: string;
  country: string;
  subject: string;
  headline: string;
  rating: number;
  reviews: number;
  languages: string[];
  online: boolean;
  responseTime: string;
  sessions: number;
  rate: string;
  specialties: string[];
};

type ReqState = "idle" | "requesting" | "sent";

export default function TutorCard({ tutor, compact = false }: { tutor: Tutor; compact?: boolean }) {
  const [state, setState] = useState<ReqState>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const request = () => {
    if (state !== "idle") return;
    setState("requesting");
    timers.current.push(setTimeout(() => setState("sent"), 1600));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
              tutor.online ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-900 font-semibold text-sm truncate">{tutor.name}</h3>
            <span className="text-xs">{tutor.flag}</span>
          </div>
          <p className="text-gray-500 text-xs truncate">{tutor.headline}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {tutor.rating}
            </span>
            <span className="text-gray-400">({tutor.reviews})</span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="w-3 h-3" /> {tutor.responseTime}
            </span>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tutor.specialties.map((s) => (
              <span key={s} className="text-xs text-gray-600 bg-gray-100 rounded-full px-2.5 py-0.5">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <Globe className="w-3 h-3" /> {tutor.languages.join(", ")}
          </div>
        </>
      )}

      <div className="flex items-center justify-between gap-3 mt-4">
        <span className={`text-xs font-medium flex items-center gap-1.5 ${tutor.online ? "text-emerald-600" : "text-gray-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tutor.online ? "bg-emerald-500" : "bg-gray-300"}`} />
          {tutor.online ? "Online now" : "Away"}
        </span>

        <button
          onClick={request}
          disabled={state !== "idle" || !tutor.online}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${
            state === "sent"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : tutor.online
              ? "bg-gray-900 text-white hover:bg-gray-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {state === "idle" && (<><Video className="w-3.5 h-3.5" /> {tutor.online ? "Request live session" : "Notify when online"}</>)}
          {state === "requesting" && (<><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting…</>)}
          {state === "sent" && (<><Check className="w-3.5 h-3.5" /> {tutor.name.split(" ")[0]} joining in {tutor.responseTime}</>)}
        </button>
      </div>
    </motion.div>
  );
}
