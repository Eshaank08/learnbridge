"use client";

import { useEffect } from "react";
import type { GraphNode, NodeState } from "@/lib/types";
import { ResourceCard } from "./ResourceCard";

// Visual state that the panel receives — includes derived "locked".
export type NodeDisplayState = "unlit" | "lit" | "mastered" | "locked";

export interface NodePanelProps {
  node: GraphNode;
  displayState: NodeDisplayState;
  /** Titles of nodes that are direct prerequisites of this node (for locked message). */
  prereqTitles: string[];
  onClose: () => void;
  /** Stub for D7 — called when "Take test to master" is clicked. */
  onTakeTest: () => void;
  /** Hoisted from useGraphProgress so the panel can set lit on open. */
  setNodeState: (id: string, state: NodeState) => void;
}

export default function NodePanel({
  node,
  displayState,
  prereqTitles,
  onClose,
  onTakeTest,
  setNodeState,
}: NodePanelProps) {
  // When an unlocked unlit node is opened, mark it lit.
  // Runs on mount (and if the node id / state changes while open).
  useEffect(() => {
    if (displayState === "unlit") {
      setNodeState(node.id, "lit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  const LEVEL_LABEL: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  const LEVEL_CLASS: Record<string, string> = {
    beginner: "bg-emerald-900/60 text-emerald-300",
    intermediate: "bg-amber-900/60 text-amber-300",
    advanced: "bg-red-900/60 text-red-300",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <aside
        className="fixed right-0 top-0 z-30 flex h-full w-full max-w-[420px] flex-col bg-slate-900 border-l border-slate-700 shadow-2xl"
        aria-label={`Details for ${node.title}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-700 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-100 leading-snug">
              {node.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">{node.concept}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 flex-shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={[
                "rounded px-2 py-0.5 text-xs font-medium",
                LEVEL_CLASS[node.level] ?? "bg-slate-800 text-slate-300",
              ].join(" ")}
            >
              {LEVEL_LABEL[node.level] ?? node.level}
            </span>
            <span className="text-xs text-slate-400">
              ~{node.estimatedMinutes} min
            </span>

            {/* Mastered badge */}
            {displayState === "mastered" && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-900/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <span aria-hidden="true">✓</span> Mastered
              </span>
            )}
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-slate-300">{node.summary}</p>

          {/* Sponsor badge */}
          {node.sponsor && (
            <div className="rounded-lg border border-amber-700/60 bg-amber-900/20 px-4 py-2.5 text-xs text-amber-300">
              This topic is free thanks to{" "}
              <span className="font-semibold">{node.sponsor.name}</span>.{" "}
              &mdash; {node.sponsor.tagline}
            </div>
          )}

          {/* Resources */}
          {node.resources.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resources
              </h3>
              <div className="space-y-2">
                {node.resources.map((r, i) => (
                  <ResourceCard key={i} resource={r} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-700 px-5 py-4">
          {displayState === "locked" && (
            <p className="text-sm text-slate-400">
              Master{" "}
              <span className="font-semibold text-slate-200">
                {prereqTitles.join(", ")}
              </span>{" "}
              to unlock.
            </p>
          )}

          {displayState === "lit" && (
            <button
              type="button"
              onClick={onTakeTest}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-semibold py-2.5 text-sm transition-colors"
            >
              Take test to master
            </button>
          )}

          {/* unlit: no CTA (becomes lit on open via effect, so this state is transient) */}
          {/* mastered: badge already shown in meta row, no CTA needed */}
        </div>
      </aside>
    </>
  );
}
