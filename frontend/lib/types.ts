// LearnBridge shared contracts — mirrors PLAN.md §Contracts.
// FROZEN after A4: change only via the orchestrator, who then notifies affected lanes.
// The Pydantic models in backend/llm.py mirror the API types below.

// ───────────────────────── Seed data (seed-data/graphs.json) ─────────────────────────

export type ResourceType = "video" | "book" | "article";

export interface Resource {
  type: ResourceType;
  title: string;
  url: string;
  source?: string;
  duration?: string;
}

export interface Sponsor {
  name: string;
  tagline: string;
  logo_placeholder: string;
}

export interface NodeTest {
  passThreshold: number; // fraction in [0,1], e.g. 0.7
  numQuestions: number;
}

export type NodeLevel = "beginner" | "intermediate" | "advanced";

export interface GraphNode {
  id: string;
  title: string;
  concept: string;
  level: NodeLevel;
  // Substantive plain-text overview (~150–250 words). ALSO the grounding context
  // Claude uses to write & grade the test — the seed validator (A5) requires ≥ 120 chars.
  summary: string;
  estimatedMinutes: number;
  resources: Resource[];
  sponsor?: Sponsor; // OPTIONAL — panel renders nothing if absent
  test: NodeTest;
}

// Edge direction: source = prerequisite, target = dependent.
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface Graph {
  id: string;
  title: string;
  subject: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ───────────────────────── Progression & storage ─────────────────────────

// Stored states only. "locked" is a DERIVED visual state — never stored, never cascaded.
export type NodeState = "unlit" | "lit" | "mastered";

// localStorage value at key `learnbridge:<graphId>:v1`.
export type Progress = Record<string, NodeState>;

// ───────────────────────── API contract (backend is stateless) ─────────────────────────

export type QuestionType = "mcq" | "short";

// correctIndex is intentionally sent to the client (demo app: deterministic MCQ grading +
// offline client-mocks). The quiz UI must simply never render it.
export interface MCQQuestion {
  id: string;
  type: "mcq";
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface ShortQuestion {
  id: string;
  type: "short";
  prompt: string;
}

// Discriminated union on `type`.
export type Question = MCQQuestion | ShortQuestion;

// POST /api/test/generate
export interface GenerateTestRequest {
  graph_id: string;
  node_id: string;
  language?: string; // optional, default "en"
}

export interface GenerateTestResponse {
  questions: Question[];
}

// POST /api/test/grade — items echo the served questions back (stateless server).
// mcq answer = chosen option index (number); short answer = free text (string).
export interface GradeItem {
  question: Question;
  answer: number | string;
}

export interface GradeTestRequest {
  graph_id: string;
  node_id: string;
  items: GradeItem[];
}

export interface PerQuestionResult {
  id: string;
  correct: boolean;
  feedback: string;
}

export interface GradeTestResponse {
  score: number; // fraction correct, equal weight
  passed: boolean; // score >= node.test.passThreshold (server computes)
  perQuestion: PerQuestionResult[];
  feedback: string; // one-paragraph overall feedback
}

// Typed error surfaced by lib/api.ts (D5) from backend 404 / 502 { "detail": "..." }.
export interface ApiError {
  status: number;
  detail: string;
}
