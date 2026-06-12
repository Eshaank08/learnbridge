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
import { nodeTypes } from "../../../components/graph/SkillNode";
import GraphHud from "../../../components/graph/GraphHud";
import NodePanel from "../../../components/graph/NodePanel";
import type { Graph } from "../../../lib/types";
import graphsJson from "../../../../seed-data/graphs.json";

const graphs = graphsJson as unknown as Graph[];

interface PageProps {
  params: { id: string };
}

export default function GraphPage({ params }: PageProps) {
  const graph = graphs.find((g) => g.id === params.id);

  if (!graph) {
    notFound();
  }

  const { progress, setNodeState, reset } = useGraphProgress(graph.id);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const unlocked = useMemo(() => unlockedSet(graph, progress), [graph, progress]);

  const { nodes, edges } = useMemo(() => {
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
  }, [graph, progress, unlocked]);

  const { mastered, total } = useMemo(
    () => completion(graph, progress),
    [graph, progress]
  );

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNodeId(node.id);
  };

  // Resolve the selected node and its panel props.
  const selectedNode = selectedNodeId
    ? graph.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  const selectedDisplayState = selectedNode
    ? displayState(selectedNode, progress, unlocked)
    : null;

  // Prereq titles: titles of nodes that are sources of edges whose target is this node.
  const prereqTitles = useMemo(() => {
    if (!selectedNodeId) return [];
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
    return graph.edges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => nodeById.get(e.source)?.title ?? e.source);
  }, [graph, selectedNodeId]);

  return (
    <div className="relative h-screen w-screen">
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

      {selectedNode && selectedDisplayState && (
        <NodePanel
          node={selectedNode}
          displayState={selectedDisplayState}
          prereqTitles={prereqTitles}
          onClose={() => setSelectedNodeId(null)}
          onTakeTest={() => {}}
          setNodeState={setNodeState}
        />
      )}
    </div>
  );
}
