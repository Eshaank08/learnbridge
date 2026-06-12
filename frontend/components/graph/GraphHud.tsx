"use client";

interface GraphHudProps {
  mastered: number;
  total: number;
  onReset: () => void;
}

// Legend entries — each state maps to a swatch using the node-* Tailwind tokens.
const LEGEND_ENTRIES = [
  {
    state: "unlit",
    label: "Unlit",
    bg: "bg-node-unlit-bg",
    border: "border-node-unlit-border",
    text: "text-node-unlit-text",
  },
  {
    state: "lit",
    label: "Lit",
    bg: "bg-node-lit-bg",
    border: "border-node-lit-border",
    text: "text-node-lit-text",
    shadow: "shadow-node-lit",
  },
  {
    state: "mastered",
    label: "Mastered",
    bg: "bg-node-mastered-bg",
    border: "border-node-mastered-border",
    text: "text-node-mastered-text",
  },
  {
    state: "locked",
    label: "Locked",
    bg: "bg-node-locked-bg",
    border: "border-node-locked-border",
    text: "text-node-locked-text",
    opacity: "opacity-60",
  },
] as const;

export default function GraphHud({ mastered, total, onReset }: GraphHudProps) {
  const pct = total === 0 ? 0 : Math.round((mastered / total) * 100);

  return (
    <div className="absolute top-4 right-4 z-10 w-56 rounded-xl bg-slate-900/90 border border-slate-700 shadow-lg backdrop-blur-sm p-4 flex flex-col gap-3">
      {/* Completion readout */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
          Progress
        </span>
        <span className="text-sm font-bold text-slate-100">
          {mastered} / {total} mastered
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-node-mastered transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={mastered}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5">
        {LEGEND_ENTRIES.map(({ state, label, bg, border, text, ...rest }) => {
          const shadow = "shadow" in rest ? (rest as { shadow: string }).shadow : undefined;
          const opacity = "opacity" in rest ? (rest as { opacity: string }).opacity : undefined;
          return (
            <div key={state} className="flex items-center gap-2">
              <span
                className={[
                  "inline-block w-4 h-4 rounded border-2 flex-shrink-0",
                  bg,
                  border,
                  shadow ?? "",
                  opacity ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              />
              <span className={`text-xs ${text}`}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Reset button */}
      <button
        type="button"
        onClick={onReset}
        className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-slate-100 text-xs font-medium py-1.5 transition-colors"
      >
        Reset progress
      </button>
    </div>
  );
}
