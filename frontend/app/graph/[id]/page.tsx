"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { layoutGraph } from "../../../lib/layout";
import { unlockedSet, displayState, completion } from "../../../lib/progression";
import { useGraphProgress } from "../../../lib/useGraphProgress";
import SkillNode, { nodeTypes } from "../../../components/graph/SkillNode";
import GraphHud from "../../../components/graph/GraphHud";
import type { Graph } from "../../../lib/types";
import graphsJson from "../../../../seed-data/graphs.json";

// Suppress unused-import warning: SkillNode is consumed by nodeTypes but not called directly.
void SkillNode;

const graphs = graphsJson as unknown as Graph[];

interface PageProps {
  params: { id: string };
}

export default function GraphPage({ params }: PageProps) {
  const graph = graphs.find((g) => g.id === params.id);

  if (!graph) {
    notFound();
  }

  const { progress, reset } = useGraphProgress(graph.id);

  // Record the selected node id for C1 to build on — no panel rendered yet.
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const unlocked = unlockedSet(graph, progress);

    // Build a lookup map from node id → GraphNode for displayState calls.
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

    const layoutResult = layoutGraph(graph);

    // Augment each layout node: add type="skill" and the computed state.
    const nodes = layoutResult.nodes.map((layoutNode) => {
      const graphNode = nodeById.get(layoutNode.id)!;
      return {
        ...layoutNode,
        type: "skill" as const,
        data: {
          ...layoutNode.data,
          state: displayState(graphNode, progress, unlocked),
        },
      };
    });

    // Style edges by the stored state of the source node.
    // Mastered source = highlighted "open path" (emerald, thicker, animated).
    // Other sources = dimmed default.
    const edges = layoutResult.edges.map((edge) => {
      const sourceState = progress[edge.source];
      const isMastered = sourceState === "mastered";
      return {
        ...edge,
        animated: isMastered,
        style: isMastered
          ? { stroke: "#10b981", strokeWidth: 3 }
          : { stroke: "#64748b", strokeWidth: 1.5, opacity: 0.5 },
      };
    });

    return { nodes, edges };
  }, [graph, progress]);

  const { mastered, total } = useMemo(
    () => completion(graph, progress),
    [graph, progress]
  );

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNodeId(node.id);
  };

  return (
    // data-selected-node is read by C1 (NodePanel) once added.
    <div className="relative h-screen w-screen" data-selected-node={selectedNodeId ?? ""}>
      <GraphHud mastered={mastered} total={total} onReset={reset} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        onNodeClick={onNodeClick}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
