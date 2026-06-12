import type { Graph, GraphNode, Progress } from "./types";

const VALID_STATES = new Set(["unlit", "lit", "mastered"]);

/**
 * Returns the set of node ids that are currently unlocked.
 *
 * A node is unlocked iff every prerequisite (sources of its incoming edges) has
 * stored state "mastered". Roots (nodes with no incoming edges) are always unlocked.
 * "locked" is never stored — it is derived from this set at render time.
 */
export function unlockedSet(graph: Graph, progress: Progress): Set<string> {
  // Build a map from node id → array of prerequisite ids (sources of incoming edges)
  const prereqs = new Map<string, string[]>(graph.nodes.map((n) => [n.id, []]));

  for (const edge of graph.edges) {
    const targets = prereqs.get(edge.target);
    if (targets !== undefined) {
      targets.push(edge.source);
    }
  }

  const unlocked = new Set<string>();

  for (const node of graph.nodes) {
    const nodePrereqs = prereqs.get(node.id) ?? [];
    const allMastered =
      nodePrereqs.length === 0 ||
      nodePrereqs.every((pid) => progress[pid] === "mastered");
    if (allMastered) {
      unlocked.add(node.id);
    }
  }

  return unlocked;
}

/**
 * Returns the display state for a single node applying §Contracts precedence:
 *   - stored "mastered" → "mastered"
 *   - stored "lit"      → "lit"
 *   - stored "unlit" (or absent / invalid) + in unlocked set → "unlit"
 *   - stored "unlit" (or absent / invalid) + NOT in unlocked set → "locked"
 *
 * Any stored value not in {"unlit","lit","mastered"} is treated as "unlit".
 */
export function displayState(
  node: GraphNode,
  progress: Progress,
  unlocked: Set<string>
): "unlit" | "lit" | "mastered" | "locked" {
  const raw = progress[node.id];
  const stored = VALID_STATES.has(raw as string) ? (raw as "unlit" | "lit" | "mastered") : "unlit";

  if (stored === "mastered") return "mastered";
  if (stored === "lit") return "lit";

  // stored is "unlit" (including coerced invalids)
  return unlocked.has(node.id) ? "unlit" : "locked";
}

/**
 * Returns completion totals counted from the seed (never from the stored map).
 *   total    = graph.nodes.length
 *   mastered = count of nodes whose stored state is "mastered" AND exist in the seed
 *
 * Stored ids not present in the seed are ignored.
 */
export function completion(
  graph: Graph,
  progress: Progress
): { mastered: number; total: number } {
  const total = graph.nodes.length;
  let mastered = 0;

  for (const node of graph.nodes) {
    if (progress[node.id] === "mastered") {
      mastered += 1;
    }
  }

  return { mastered, total };
}
