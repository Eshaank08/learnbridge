"use client";

import { notFound } from "next/navigation";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { layoutGraph } from "../../../lib/layout";
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

  const { nodes, edges } = layoutGraph(graph);

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
