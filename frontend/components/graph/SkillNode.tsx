"use client";

import { Handle, Position, NodeProps, Node } from "@xyflow/react";

// Visual state includes the derived "locked" state (never stored, computed per render).
export type SkillNodeVisualState = "unlit" | "lit" | "mastered" | "locked";

export interface SkillNodeData extends Record<string, unknown> {
  title: string;
  concept: string;
  state: SkillNodeVisualState;
}

// Convenience alias for registering with React Flow nodeTypes.
export type SkillNodeType = Node<SkillNodeData, "skill">;

// Per-state Tailwind class sets (all tokens come from tailwind.config.ts — node-* + shadow-node-lit).
const STATE_CLASSES: Record<
  SkillNodeVisualState,
  { wrapper: string; title: string; concept: string; icon: React.ReactNode }
> = {
  unlit: {
    wrapper:
      "bg-node-unlit-bg border-2 border-node-unlit-border rounded-lg px-4 py-3 w-[220px] min-h-[80px] flex flex-col justify-center",
    title: "text-sm font-semibold text-node-unlit-text leading-tight",
    concept: "text-xs text-node-unlit-text opacity-70 mt-0.5",
    icon: null,
  },
  lit: {
    wrapper:
      "bg-node-lit-bg border-2 border-node-lit-border rounded-lg px-4 py-3 w-[220px] min-h-[80px] flex flex-col justify-center shadow-node-lit",
    title: "text-sm font-semibold text-node-lit-text leading-tight",
    concept: "text-xs text-node-lit-text opacity-80 mt-0.5",
    icon: null,
  },
  mastered: {
    wrapper:
      "bg-node-mastered-bg border-2 border-node-mastered-border rounded-lg px-4 py-3 w-[220px] min-h-[80px] flex flex-col justify-center",
    title: "text-sm font-semibold text-node-mastered-text leading-tight",
    concept: "text-xs text-node-mastered-text opacity-80 mt-0.5",
    icon: (
      <span className="text-node-mastered-text text-base leading-none ml-1.5" aria-hidden="true">
        ✓
      </span>
    ),
  },
  locked: {
    wrapper:
      "bg-node-locked-bg border-2 border-node-locked-border rounded-lg px-4 py-3 w-[220px] min-h-[80px] flex flex-col justify-center opacity-60",
    title: "text-sm font-semibold text-node-locked-text leading-tight",
    concept: "text-xs text-node-locked-text opacity-60 mt-0.5",
    icon: (
      <span className="text-node-locked-text text-base leading-none ml-1.5" aria-hidden="true">
        🔒
      </span>
    ),
  },
};

export default function SkillNode({ data }: NodeProps<SkillNodeType>) {
  const { title, concept, state } = data;
  const classes = STATE_CLASSES[state] ?? STATE_CLASSES.unlit;

  return (
    <div className={classes.wrapper}>
      {/* Incoming edge handle — prerequisites connect here */}
      <Handle type="target" position={Position.Top} />

      {/* Node content */}
      <div className="flex items-start justify-between">
        <span className={classes.title}>{title}</span>
        {classes.icon}
      </div>
      <span className={classes.concept}>{concept}</span>

      {/* Outgoing edge handle — dependents connect here */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Convenience export for React Flow nodeTypes registration in B6:
//   import SkillNode, { nodeTypes } from "@/components/graph/SkillNode";
//   <ReactFlow nodeTypes={nodeTypes} ... />
export const nodeTypes = { skill: SkillNode } as const;
