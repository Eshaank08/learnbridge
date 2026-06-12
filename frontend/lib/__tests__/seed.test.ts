import { describe, it, expect } from "vitest";
import { validateGraph } from "../validateGraph";
import type { Graph } from "../types";
import rawGraphs from "../../../seed-data/graphs.json";

// Cast the imported JSON to the correct type.
const graphs = rawGraphs as unknown as Graph[];

// ── Helper: build a minimal valid single-node graph ──────────────────────────
const LONG_SUMMARY =
  "This summary is exactly long enough to pass the 120-character minimum enforced by " +
  "the seed validator because it contains sufficient descriptive text about the topic.";

function makeGraph(overrides?: Partial<Graph>): Graph {
  return {
    id: "test",
    title: "Test Graph",
    subject: "Test",
    description: "A test graph.",
    nodes: [
      {
        id: "a",
        title: "A",
        concept: "concept a",
        level: "beginner",
        summary: LONG_SUMMARY,
        estimatedMinutes: 10,
        resources: [],
        test: { passThreshold: 0.7, numQuestions: 3 },
      },
      {
        id: "b",
        title: "B",
        concept: "concept b",
        level: "intermediate",
        summary: LONG_SUMMARY,
        estimatedMinutes: 20,
        resources: [],
        test: { passThreshold: 0.7, numQuestions: 3 },
      },
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
    ...overrides,
  };
}

// ── Real seed ────────────────────────────────────────────────────────────────

describe("validateGraph — real seed-data/graphs.json", () => {
  it("contains at least one graph", () => {
    expect(graphs.length).toBeGreaterThan(0);
  });

  for (const graph of graphs) {
    it(`graph "${graph.id}" passes validation with no errors`, () => {
      const errors = validateGraph(graph);
      expect(errors).toEqual([]);
    });
  }
});

// ── Broken fixtures ───────────────────────────────────────────────────────────

describe("validateGraph — broken fixtures must be rejected", () => {
  it("detects a cycle", () => {
    const cycleGraph: Graph = {
      id: "cycle-test",
      title: "Cycle Graph",
      subject: "Test",
      description: "Has a cycle.",
      nodes: [
        {
          id: "x",
          title: "X",
          concept: "x",
          level: "beginner",
          summary: LONG_SUMMARY,
          estimatedMinutes: 10,
          resources: [],
          test: { passThreshold: 0.7, numQuestions: 3 },
        },
        {
          id: "y",
          title: "Y",
          concept: "y",
          level: "intermediate",
          summary: LONG_SUMMARY,
          estimatedMinutes: 10,
          resources: [],
          test: { passThreshold: 0.7, numQuestions: 3 },
        },
        {
          id: "z",
          title: "Z",
          concept: "z",
          level: "advanced",
          summary: LONG_SUMMARY,
          estimatedMinutes: 10,
          resources: [],
          test: { passThreshold: 0.7, numQuestions: 3 },
        },
      ],
      edges: [
        { id: "e1", source: "x", target: "y" },
        { id: "e2", source: "y", target: "z" },
        { id: "e3", source: "z", target: "x" }, // cycle: z → x
      ],
    };

    const errors = validateGraph(cycleGraph);
    expect(errors.some((e) => /cycle/i.test(e))).toBe(true);
  });

  it("detects a dangling edge endpoint", () => {
    const danglingGraph: Graph = makeGraph({
      edges: [
        { id: "e1", source: "a", target: "b" },
        { id: "e2", source: "b", target: "nonexistent-node" }, // target does not exist
      ],
    });

    const errors = validateGraph(danglingGraph);
    expect(
      errors.some((e) => /unknown.*target|target.*unknown/i.test(e))
    ).toBe(true);
  });

  it("detects a duplicate node id", () => {
    const dupGraph: Graph = {
      ...makeGraph(),
      nodes: [
        {
          id: "a",
          title: "A first",
          concept: "c",
          level: "beginner",
          summary: LONG_SUMMARY,
          estimatedMinutes: 10,
          resources: [],
          test: { passThreshold: 0.7, numQuestions: 3 },
        },
        {
          id: "a", // duplicate!
          title: "A second",
          concept: "c",
          level: "intermediate",
          summary: LONG_SUMMARY,
          estimatedMinutes: 20,
          resources: [],
          test: { passThreshold: 0.7, numQuestions: 3 },
        },
      ],
    };

    const errors = validateGraph(dupGraph);
    expect(errors.some((e) => /duplicate/i.test(e))).toBe(true);
  });

  it("detects a too-short summary", () => {
    const shortSummaryGraph: Graph = makeGraph({
      nodes: [
        {
          id: "a",
          title: "A",
          concept: "concept",
          level: "beginner",
          summary: "Too short.", // well under 120 chars
          estimatedMinutes: 10,
          resources: [],
          test: { passThreshold: 0.7, numQuestions: 3 },
        },
      ],
      edges: [],
    });

    const errors = validateGraph(shortSummaryGraph);
    expect(errors.some((e) => /summary.*short|too short/i.test(e))).toBe(true);
  });
});
