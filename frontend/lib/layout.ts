import { Graph, layout } from "@dagrejs/dagre";
import { MarkerType } from "@xyflow/react";
import type { Graph as LearnGraph } from "./types";

export const NODE_W = 220;
export const NODE_H = 80;

export interface LayoutNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    title: string;
    concept: string;
  };
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  markerEnd: { type: typeof MarkerType.ArrowClosed };
}

export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}

/**
 * Pure function — no rendering, no React, no reading the seed file.
 * Lays out a LearnBridge Graph using dagre (rankdir TB) and returns
 * React Flow–compatible nodes and edges.
 */
export function layoutGraph(graph: LearnGraph): LayoutResult {
  const g = new Graph();
  g.setGraph({ rankdir: "TB" });
  // dagre requires a default edge label; an empty object is conventional
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of graph.nodes) {
    g.setNode(node.id, { width: NODE_W, height: NODE_H });
  }

  for (const edge of graph.edges) {
    g.setEdge(edge.source, edge.target);
  }

  layout(g);

  const nodes: LayoutNode[] = graph.nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      id: node.id,
      // dagre gives centre coords; convert to top-left for React Flow
      position: {
        x: dagreNode.x - NODE_W / 2,
        y: dagreNode.y - NODE_H / 2,
      },
      data: {
        label: node.title,
        title: node.title,
        concept: node.concept,
      },
    };
  });

  const edges: LayoutEdge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges };
}
