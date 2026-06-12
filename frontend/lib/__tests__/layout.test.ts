import { describe, it, expect } from "vitest";
import { layoutGraph } from "../layout";
import type { Graph } from "../types";

// Inline 3-node fixture: A → B → C (does NOT import graphs.json)
const fixture: Graph = {
  id: "test-fixture",
  title: "Test Graph",
  subject: "Test",
  description: "A three-node linear fixture for layout testing.",
  nodes: [
    {
      id: "A",
      title: "Node A",
      concept: "Concept A",
      level: "beginner",
      summary: "A".repeat(130),
      estimatedMinutes: 10,
      resources: [],
      test: { passThreshold: 0.7, numQuestions: 3 },
    },
    {
      id: "B",
      title: "Node B",
      concept: "Concept B",
      level: "intermediate",
      summary: "B".repeat(130),
      estimatedMinutes: 20,
      resources: [],
      test: { passThreshold: 0.7, numQuestions: 3 },
    },
    {
      id: "C",
      title: "Node C",
      concept: "Concept C",
      level: "advanced",
      summary: "C".repeat(130),
      estimatedMinutes: 30,
      resources: [],
      test: { passThreshold: 0.7, numQuestions: 3 },
    },
  ],
  edges: [
    { id: "e-AB", source: "A", target: "B" },
    { id: "e-BC", source: "B", target: "C" },
  ],
};

describe("layoutGraph", () => {
  it("returns a node and edge for every input node/edge", () => {
    const { nodes, edges } = layoutGraph(fixture);
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
  });

  it("assigns distinct positions to all three nodes", () => {
    const { nodes } = layoutGraph(fixture);
    const positions = nodes.map((n) => `${n.position.x},${n.position.y}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(3);
  });

  it("orders nodes top-to-bottom: y(A) < y(B) < y(C) for rankdir TB", () => {
    const { nodes } = layoutGraph(fixture);
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    expect(byId["A"].position.y).toBeLessThan(byId["B"].position.y);
    expect(byId["B"].position.y).toBeLessThan(byId["C"].position.y);
  });

  it("node data includes label, title, and concept", () => {
    const { nodes } = layoutGraph(fixture);
    const a = nodes.find((n) => n.id === "A")!;
    expect(a.data.label).toBe("Node A");
    expect(a.data.title).toBe("Node A");
    expect(a.data.concept).toBe("Concept A");
  });

  it("edges have source, target, and arrowhead markerEnd", () => {
    const { edges } = layoutGraph(fixture);
    const ab = edges.find((e) => e.id === "e-AB")!;
    expect(ab.source).toBe("A");
    expect(ab.target).toBe("B");
    expect(ab.markerEnd).toBeDefined();
    expect(ab.markerEnd.type).toBeTruthy();
  });
});
