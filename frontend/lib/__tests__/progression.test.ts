import { describe, it, expect } from "vitest";
import { unlockedSet, displayState, completion } from "../progression";
import type { Graph, GraphNode, Progress } from "../types";

// ─── Inline fixtures (never imports graphs.json) ───────────────────────────

function makeNode(id: string): GraphNode {
  return {
    id,
    title: id,
    concept: id,
    level: "beginner",
    summary: "placeholder summary text that is long enough to satisfy the validator requirement",
    estimatedMinutes: 10,
    resources: [],
    test: { passThreshold: 0.7, numQuestions: 3 },
  };
}

/** Linear chain: A → B → C */
const linearGraph: Graph = {
  id: "test-linear",
  title: "Linear",
  subject: "Test",
  description: "A → B → C",
  nodes: [makeNode("A"), makeNode("B"), makeNode("C")],
  edges: [
    { id: "e1", source: "A", target: "B" },
    { id: "e2", source: "B", target: "C" },
  ],
};

/** Diamond: A → B, A → C, B → D, C → D  (D has two prerequisites: B and C) */
const diamondGraph: Graph = {
  id: "test-diamond",
  title: "Diamond",
  subject: "Test",
  description: "A → B, A → C; B,C → D",
  nodes: [makeNode("A"), makeNode("B"), makeNode("C"), makeNode("D")],
  edges: [
    { id: "e1", source: "A", target: "B" },
    { id: "e2", source: "A", target: "C" },
    { id: "e3", source: "B", target: "D" },
    { id: "e4", source: "C", target: "D" },
  ],
};

// ─── unlockedSet ───────────────────────────────────────────────────────────

describe("unlockedSet", () => {
  it("root node is unlocked with empty progress", () => {
    const unlocked = unlockedSet(linearGraph, {});
    expect(unlocked.has("A")).toBe(true);
  });

  it("non-root is locked with empty progress", () => {
    const unlocked = unlockedSet(linearGraph, {});
    expect(unlocked.has("B")).toBe(false);
    expect(unlocked.has("C")).toBe(false);
  });

  it("child unlocks only when its single prerequisite is mastered", () => {
    const unlocked = unlockedSet(linearGraph, { A: "mastered" });
    expect(unlocked.has("B")).toBe(true);
    expect(unlocked.has("C")).toBe(false);
  });

  it("multi-prereq node (D) stays locked if only one prerequisite is mastered", () => {
    // D needs both B and C mastered — only B mastered here
    const progress: Progress = { A: "mastered", B: "mastered" };
    const unlocked = unlockedSet(diamondGraph, progress);
    expect(unlocked.has("D")).toBe(false);
  });

  it("multi-prereq node unlocks only when ALL prerequisites are mastered", () => {
    const progress: Progress = { A: "mastered", B: "mastered", C: "mastered" };
    const unlocked = unlockedSet(diamondGraph, progress);
    expect(unlocked.has("D")).toBe(true);
  });

  it("unknown ids in progress do not crash and do not affect unlocking", () => {
    const progress: Progress = { UNKNOWN_ID: "mastered" };
    expect(() => unlockedSet(linearGraph, progress)).not.toThrow();
    const unlocked = unlockedSet(linearGraph, progress);
    // B is not unlocked — UNKNOWN_ID is not a real prerequisite
    expect(unlocked.has("B")).toBe(false);
  });
});

// ─── displayState ──────────────────────────────────────────────────────────

describe("displayState", () => {
  const nodeA = makeNode("A");
  const nodeB = makeNode("B");

  it("mastered node displays as mastered (never locked)", () => {
    const unlocked = new Set<string>(); // A is NOT in the unlocked set
    // stored mastered always overrides
    expect(displayState(nodeA, { A: "mastered" }, unlocked)).toBe("mastered");
  });

  it("lit node displays as lit even if not unlocked", () => {
    const unlocked = new Set<string>();
    expect(displayState(nodeA, { A: "lit" }, unlocked)).toBe("lit");
  });

  it("unlit + unlocked → unlit", () => {
    const unlocked = new Set(["B"]);
    expect(displayState(nodeB, { B: "unlit" }, unlocked)).toBe("unlit");
  });

  it("unlit + not unlocked → locked", () => {
    const unlocked = new Set<string>(); // B not in set
    expect(displayState(nodeB, { B: "unlit" }, unlocked)).toBe("locked");
  });

  it("no stored state + unlocked → unlit (default unlit)", () => {
    const unlocked = new Set(["A"]);
    expect(displayState(nodeA, {}, unlocked)).toBe("unlit");
  });

  it("no stored state + not unlocked → locked", () => {
    const unlocked = new Set<string>();
    expect(displayState(nodeB, {}, unlocked)).toBe("locked");
  });

  it("invalid stored state treated as unlit → locked when not unlocked", () => {
    const unlocked = new Set<string>();
    // Cast to bypass TS to simulate corrupt storage value
    const progress = { B: "INVALID_STATE" } as unknown as Progress;
    expect(displayState(nodeB, progress, unlocked)).toBe("locked");
  });

  it("invalid stored state treated as unlit → unlit when unlocked", () => {
    const unlocked = new Set(["B"]);
    const progress = { B: "INVALID_STATE" } as unknown as Progress;
    expect(displayState(nodeB, progress, unlocked)).toBe("unlit");
  });
});

// ─── completion ────────────────────────────────────────────────────────────

describe("completion", () => {
  it("total equals graph.nodes.length", () => {
    const { total } = completion(linearGraph, {});
    expect(total).toBe(3);
  });

  it("mastered count is 0 with empty progress", () => {
    const { mastered } = completion(linearGraph, {});
    expect(mastered).toBe(0);
  });

  it("counts only nodes whose stored state is mastered AND exist in the seed", () => {
    const progress: Progress = { A: "mastered", B: "lit" };
    const { mastered } = completion(linearGraph, progress);
    expect(mastered).toBe(1);
  });

  it("unknown ids in progress are ignored (not counted in mastered)", () => {
    const progress: Progress = { UNKNOWN_ID: "mastered" };
    const { mastered, total } = completion(linearGraph, progress);
    expect(mastered).toBe(0);
    expect(total).toBe(3); // still counts from seed
  });

  it("all nodes mastered → mastered === total", () => {
    const progress: Progress = { A: "mastered", B: "mastered", C: "mastered" };
    const { mastered, total } = completion(linearGraph, progress);
    expect(mastered).toBe(3);
    expect(total).toBe(3);
  });
});
