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
import QuizModal from "../../../components/graph/QuizModal";
import { generateTest, gradeTest } from "../../../lib/api";
import type { Graph, Question, GradeTestResponse, GradeItem, ApiError } from "../../../lib/types";
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

  // ── Quiz modal state ──
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizNodeId, setQuizNodeId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizResult, setQuizResult] = useState<GradeTestResponse | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

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

  // ── Quiz handlers ──

  async function handleTakeTest(nodeId: string) {
    // Guard against double-fire while a generate request is already in-flight.
    if (quizLoading) return;
    setQuizNodeId(nodeId);
    setQuizOpen(true);
    setQuizResult(null);
    setQuizError(null);
    setQuizLoading(true);
    try {
      const res = await generateTest({ graph_id: graph!.id, node_id: nodeId });
      setQuizQuestions(res.questions);
    } catch (err) {
      const apiErr = err as ApiError;
      setQuizError(apiErr?.detail ?? "Failed to load questions. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  }

  async function handleQuizSubmit(items: GradeItem[]) {
    if (!quizNodeId) return;
    setQuizLoading(true);
    setQuizError(null);
    setQuizResult(null);
    try {
      const res = await gradeTest({ graph_id: graph!.id, node_id: quizNodeId, items });
      setQuizResult(res);
      if (res.passed) {
        setNodeState(quizNodeId, "mastered");
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setQuizError(apiErr?.detail ?? "Grading failed. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  }

  function handleQuizRetake() {
    // Clear result so the modal returns to the question view.
    // QuizModal already cleared its own answer state via handleRetake.
    setQuizResult(null);
  }

  function handleQuizRetry() {
    // If generate failed (no questions loaded yet), re-run generate.
    // Otherwise (grade failed, questions are intact) just clear the error
    // so the student can re-submit their existing answers.
    if (quizQuestions.length === 0 && quizNodeId) {
      void handleTakeTestRetry(quizNodeId);
    } else {
      setQuizError(null);
    }
  }

  async function handleTakeTestRetry(nodeId: string) {
    setQuizError(null);
    setQuizLoading(true);
    try {
      const res = await generateTest({ graph_id: graph!.id, node_id: nodeId });
      setQuizQuestions(res.questions);
    } catch (err) {
      const apiErr = err as ApiError;
      setQuizError(apiErr?.detail ?? "Failed to load questions. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  }

  function handleQuizClose() {
    setQuizOpen(false);
    setQuizQuestions([]);
    setQuizResult(null);
    setQuizError(null);
    setQuizNodeId(null);
  }

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
          onTakeTest={() => handleTakeTest(selectedNode.id)}
          setNodeState={setNodeState}
        />
      )}

      <QuizModal
        open={quizOpen}
        questions={quizQuestions}
        result={quizResult}
        loading={quizLoading}
        error={quizError}
        onClose={handleQuizClose}
        onSubmit={handleQuizSubmit}
        onRetake={handleQuizRetake}
        onRetry={handleQuizRetry}
      />
    </div>
  );
}
