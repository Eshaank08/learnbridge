import type { Graph } from "./types";

/**
 * Validates a Graph and returns a list of error/warning strings.
 * An empty list means the graph is valid.
 *
 * Checks performed:
 *  - duplicate node ids
 *  - edge endpoints (source/target) that don't exist among node ids
 *  - self-loops (source === target)
 *  - cycles in the edge set (DAG check via topological sort)
 *  - any node summary < 120 chars
 *  - WARN on presence of reserved `hidden` / `unlockedBy` fields on a node (Phase G reserved)
 */
export function validateGraph(g: Graph): string[] {
  const errors: string[] = [];

  // ── 1. Duplicate node ids ───────────────────────────────────────────────
  const nodeIds = new Set<string>();
  for (const node of g.nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node id: "${node.id}"`);
    } else {
      nodeIds.add(node.id);
    }
  }

  // ── 2. Reserved Phase-G fields on nodes ────────────────────────────────
  for (const node of g.nodes) {
    const n = node as unknown as Record<string, unknown>;
    if ("hidden" in n) {
      errors.push(
        `WARN: node "${node.id}" contains reserved field "hidden" (Phase G — must be omitted in MVP seeds)`
      );
    }
    if ("unlockedBy" in n) {
      errors.push(
        `WARN: node "${node.id}" contains reserved field "unlockedBy" (Phase G — must be omitted in MVP seeds)`
      );
    }
  }

  // ── 3. Summary length ≥ 120 chars ──────────────────────────────────────
  for (const node of g.nodes) {
    if (node.summary.length < 120) {
      errors.push(
        `Node "${node.id}" summary is too short (${node.summary.length} chars, minimum 120)`
      );
    }
  }

  // ── 4. Edge validations (only check edges against the de-duped node set) ─
  for (const edge of g.edges) {
    // Self-loop
    if (edge.source === edge.target) {
      errors.push(`Self-loop on edge "${edge.id}": source and target are both "${edge.source}"`);
    }

    // Dangling source
    if (!nodeIds.has(edge.source)) {
      errors.push(
        `Edge "${edge.id}" has unknown source node id: "${edge.source}"`
      );
    }

    // Dangling target
    if (!nodeIds.has(edge.target)) {
      errors.push(
        `Edge "${edge.id}" has unknown target node id: "${edge.target}"`
      );
    }
  }

  // ── 5. Cycle detection — Kahn's algorithm (topological sort) ───────────
  // Build adjacency: source → targets (prerequisite → dependents)
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of Array.from(nodeIds)) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of g.edges) {
    // Skip edges with dangling endpoints — we already reported those above.
    // Including them would skew in-degree counts and produce false cycle reports.
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    // Skip self-loops for the same reason.
    if (edge.source === edge.target) continue;

    adj.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of Array.from(inDegree.entries())) {
    if (deg === 0) queue.push(id);
  }

  let processed = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    processed++;
    for (const neighbor of adj.get(node) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (processed < nodeIds.size) {
    errors.push(
      `Graph "${g.id}" contains a cycle — the edge set is not a DAG (cycle would deadlock node unlocking)`
    );
  }

  return errors;
}
