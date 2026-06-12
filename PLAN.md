# PLAN — LearnBridge Learning Graph (skill-tree)

## Context

LearnBridge is a Claude Builders Club hackathon project (Education theme). The repo
currently holds **only planning docs — no code**. The documented MVP is a *search-first*
loop: student types a question in any language → Claude matches seeded lessons → lesson
view + sponsor badge → follow-up Q&A (see `vision.md`, `docs/ARCHITECTURE.md`).

`ideas.md` proposes a different, more compelling primary experience: a **learning graph
inspired by game skill-trees**. Topics are **nodes** with linked materials (videos, books,
articles); **directed edges** encode prerequisites (Calculus → Differential Equations);
each node is **unlit → lit → mastered**, and mastery is earned by **passing an
AI-generated test**. Graphs are self-contained, shareable subject roadmaps.

We are on branch `graph` — this is the focused workstream for that feature.

**Decisions locked with the user (this plan implements exactly these):**
1. **Graph is the hero, graph-first.** The skill-tree is the primary navigation. The
   planned "lesson view" is reused as the node-detail panel. Search (if built) only jumps
   to a node — it is not the spine.
2. **Scope = view & learn a *seeded* graph.** Render a pre-authored graph, light/master
   nodes, open materials, take tests, persist progress. **No in-app graph authoring.**
3. **Mastery = AI quiz graded by Claude**, generated from the node's own materials, with a
   `MOCK_MODE` fallback for flaky hackathon WiFi (`PROBLEMS.md` P1.3).
4. **Extend the FastAPI backend** for the AI calls; **student progress lives in browser
   `localStorage`** (no auth, no DB — consistent with the project rules and `TEAM.md`).

**Intended outcome:** a polished, demoable skill-tree where a student opens a Mathematics
roadmap, watches the cascade of locked → unlocked nodes, passes a Claude-generated quiz on
a topic, and watches dependent topics light up — proving access + AI + gamified mastery in
under 90 seconds. A one-click **quiz-in-Hindi** toggle keeps the pitch's equity story
("opportunity isn't equal", `docs/BRIEF.md` Act 1) alive even though the graph UI is English.

---

## Execution model — Opus 4.8 orchestrator + Sonnet subagents

This plan is written to be executed by an **Opus 4.8 orchestrator** (`claude-opus-4-8`)
that drives the implementation waves and spawns **Sonnet subagents**
(`claude-sonnet-4-6`), one per step. Phases A–F are the orchestration checkpoints; *within* a phase
(and across phases where the dependency graph allows — notably Phase D's backend lane runs
concurrently with B/C) the orchestrator runs independent steps in parallel.

**Step anatomy.** Every step below declares:
- **Agent** — who implements it (`Sonnet` = a `claude-sonnet-4-6` subagent; `Orchestrator`
  = the Opus 4.8 agent itself, reserved for contract-owning work).
- **Needs** — steps that must be merged first. A step may start the moment its Needs are merged.
- **Owns** — the only files the step may create/edit. Two steps may run in parallel **iff
  their Owns sets are disjoint**; the plan is sliced so this holds for every `∥` pairing.
- **Done when** — an executable check (test / curl / visible behavior). The subagent runs it
  and pastes the output in its report; the orchestrator re-runs it before committing.

**Orchestrator rules:**
1. One step = one commit, message `feat(<step-id>): <title>`. Review the diff against the
   step spec before committing; reject scope creep.
2. **Contracts are frozen after A4.** `frontend/lib/types.ts`, `seed-data/graphs.json`
   schema, and the API shapes in §Contracts change only via the orchestrator, which then
   notifies affected lanes. Subagents who find a contract gap STOP and report — no improvising.
3. **All dependencies are installed in the scaffold steps (A2/A3) or by the orchestrator** —
   parallel agents must never touch `package.json` / `requirements.txt` (merge-conflict magnet).
4. Run lanes, not one-offs: a persistent subagent per lane (continued via SendMessage) keeps
   context across its sequential steps — FE-engine, FE-components, Backend, Content (see
   §Suggested schedule). Keep ≤4 subagents live at once.
5. Phase boundary = orchestrator smoke check: run the relevant §Verification block before
   declaring the phase done.

**Subagent prompt template** (orchestrator fills `<...>`):

```
You are implementing exactly ONE step of LearnBridge (branch `graph`).
Read first: PLAN.md §Architecture overview, §Contracts, and your step block below.
<paste the full step block for <ID>>
Rules:
- Create/edit ONLY the files listed under Owns. Do not touch types.ts, graphs.json,
  package.json, requirements.txt, or PLAN.md.
- Follow §Contracts exactly. If a contract seems wrong or incomplete, STOP and report
  the problem instead of working around it.
- Match the existing code style; no extra features, no TODOs, no placeholder logic.
- Before finishing, execute the "Done when" check and include its real output.
Report back: files changed, done-when output, anything the next step must know.
```

---

## Architecture overview

Monorepo matching the existing `README.md` quick-start (`frontend/`, `backend/`):

```
frontend/   Next.js 14 (App Router, TS) + Tailwind  → graph canvas, node panel, quiz UI
backend/    Python FastAPI + Claude API             → ONLY the AI test (generate + grade)
seed-data/  graphs.json                             → self-contained roadmaps (structure + materials)
```

**Data-flow split (deliberately minimises live-failure surface):**
- **Graph structure + materials** are imported **client-side** from `seed-data/graphs.json`
  → instant, works offline, no API needed to render or navigate the tree.
- **Progress** lives in **`localStorage`** (see §Contracts → Progress storage). A visible
  **Reset** button supports repeat demos.
- **The backend is touched for exactly one thing: the AI mastery test** (generate
  questions, grade answers). This is the single live-Claude surface; `MOCK_MODE=true`
  (the default until demo day, per `TEAM.md`) serves template-based mock responses **for
  any node**, so the whole app demos offline — including the fail-and-retake path.
- Demo fallback chain: live Claude → backend `MOCK_MODE` → frontend client-mock toggle
  (`D5`), so even a dead backend doesn't kill the demo.

**Library choices:** **React Flow (`@xyflow/react`)** for the canvas — declarative,
custom node styling, built-in pan/zoom. **`@dagrejs/dagre`** (the maintained fork; the
plain `dagre` npm package is archived) auto-lays-out the DAG top-down so seed authors
never hand-place coordinates. Known React Flow gotchas are baked into step specs: the
canvas container needs an explicit height or it renders blank; `@xyflow/react/dist/style.css`
must be imported; nodes are draggable/connectable by default and must be disabled for a
skill tree; dagre needs fixed node dimensions.

**Node-state model:** three **stored** states from `ideas.md` — `unlit`, `lit`, `mastered` —
plus one **derived** visual state **`locked`**. Locked is *never stored and never cascaded*:
it is recomputed per render by a pure function over `(edges × stored states)`. Mastering a
node writes exactly **one** localStorage key; dependents appear to "unlock" because the
derived set changed — the cascade is an animation, not a data operation. Full semantics
(precedence, transitions, edge direction) are frozen in §Contracts.

**AI reliability:** both Claude calls use **structured outputs** (Pydantic models via the
Python SDK's `client.messages.parse(...)` on `claude-sonnet-4-6`) instead of "JSON only"
prompting — this removes the malformed-JSON/markdown-fence failure class entirely. MCQ
grading is deterministic in Python (generation returns `correctIndex`); Claude grades only
the short answers. The pass/fail moment — the demo's climax — therefore has the smallest
possible live-AI surface while still being honestly AI-generated and AI-graded.

**Reuse from existing docs:** sponsor badge + tagline (`ARCHITECTURE.md` sponsor model) on
the node panel; lesson `content_summary` ↔ node `summary` as the test-grounding context;
`MOCK_MODE` pattern and `prompts.py` constants pattern (`META-PROMPT.md`, `TEAM.md`
Person 3); Tailwind design system (`TEAM.md` Eshaan).

---

## Contracts (frozen after A4 — orchestrator-owned)

Everything in this section is the shared spec all subagents build against. Mirrored as TS
types in `frontend/lib/types.ts` and Pydantic models in `backend/llm.py`.

### Seed data — `seed-data/graphs.json` (a **list** of graphs)

```jsonc
[
  {
    "id": "math",
    "title": "Mathematics: Arithmetic → Differential Equations",
    "subject": "Mathematics",
    "description": "A roadmap from numbers to differential equations.",
    "nodes": [
      {
        "id": "calculus",
        "title": "Calculus",
        "concept": "Differentiation & Integration",
        "level": "intermediate",                  // "beginner" | "intermediate" | "advanced"
        "summary": "Substantive plain-text overview (~150–250 words) — ALSO the grounding context Claude uses to write & grade the test.",
        "estimatedMinutes": 45,
        "resources": [
          { "type": "video",   "title": "Essence of Calculus", "url": "https://...", "source": "3Blue1Brown", "duration": "17 min" },
          { "type": "book",    "title": "Calculus", "url": "https://...", "source": "Gilbert Strang (OpenStax)" },
          { "type": "article", "title": "Intro to Derivatives", "url": "https://..." }
        ],
        "sponsor": { "name": "Wolfram", "tagline": "Computation for every learner.", "logo_placeholder": "wolfram" },  // OPTIONAL — panel renders nothing if absent
        "test": { "passThreshold": 0.7, "numQuestions": 4 }
      }
    ],
    "edges": [
      { "id": "e1", "source": "calculus", "target": "differential-equations" }
    ]
  }
]
```

- `hidden` / `unlockedBy` are **reserved for Phase F** — MVP seeds must omit them (the
  seed validator warns if present; MVP rendering would ignore them anyway).
- Edge direction: `source` = prerequisite, `target` = dependent.
- Seeds are hand-authored → **must pass the A5 validator**: unique node ids; every edge
  endpoint exists; no self-loops; the edge set is a DAG (a cycle would deadlock unlocking
  forever, silently); every `summary` ≥ 120 chars (it is the test's ground truth).

### Progression semantics

- Stored states: `"unlit" | "lit" | "mastered"`. Anything else found in storage → treat as `unlit`.
- **Unlocked(n)** ⇔ every prerequisite of `n` (sources of incoming edges) is `mastered`.
  Roots (no incoming edges) are always unlocked. Computed by a pure function
  `unlockedSet(graph, progress)` — never stored.
- Display precedence: stored `mastered`/`lit` always display as such; `locked` styling
  applies **only** to `unlit` nodes that are not unlocked.
- Transitions: opening an **unlocked** `unlit` node → `lit` (opening a *locked* node shows a
  read-only panel and must NOT set `lit`); passing its test → `mastered` (never downgraded);
  failing → stays `lit`, unlimited retakes.

### Progress storage (localStorage)

- Key `learnbridge:<graphId>:v1` → JSON `Record<nodeId, NodeState>`.
- SSR-safe: read only inside `useEffect`/client components — `localStorage` does not exist
  server-side and naive reads cause hydration errors.
- Defensive: `JSON.parse` in try/catch (corrupt → fresh `{}`); ignore stored ids not in the
  current seed (seeds get edited all day); completion totals (`X / Y`) always count from the
  **seed**, never from the stored map. Reset deletes the graph's key.

### API contract (backend is **stateless** — the client echoes questions back for grading)

`Question` (discriminated union on `type`; `correctIndex` is intentionally sent to the
client — demo app, it enables deterministic MCQ grading and offline client-mocks; the quiz
UI must simply never render it):

```jsonc
{ "id": "q1", "type": "mcq",   "prompt": "...", "options": ["A","B","C","D"], "correctIndex": 2 }
{ "id": "q4", "type": "short", "prompt": "..." }
```

`POST /api/test/generate`
```jsonc
// request                                          // response 200
{ "graph_id": "math", "node_id": "calculus",        { "questions": [ /* Question[] — numQuestions total,
  "language": "en" /* optional, default "en" */ }       mostly mcq + 1–2 short */ ] }
```

`POST /api/test/grade`
```jsonc
// request — items echo the served questions        // response 200
{ "graph_id": "math", "node_id": "calculus",        { "score": 0.75,            // fraction correct, equal weight
  "items": [                                          "passed": true,           // score >= node.test.passThreshold (server computes)
    { "question": { /* Question as served */ },       "perQuestion": [ { "id": "q1", "correct": true, "feedback": "..." } ],
      "answer": 2 /* mcq: option index */ },          "feedback": "one-paragraph overall feedback" }
    { "question": { /* short Question */ },
      "answer": "free text" }
  ] }
```

- Errors: `404 {"detail": "..."}` unknown `graph_id`/`node_id`; `502 {"detail": "..."}` when a
  live Claude call fails or its output can't be validated — the frontend shows an in-modal
  retry and never silently passes anyone.
- Grading split: MCQ compared to `correctIndex` in Python (no AI); short answers graded by
  Claude against the node `summary` (answers may be in any language).
- `MOCK_MODE=true`: generate templates `numQuestions` questions from the node's own
  title/summary (works for **every** node, no canned per-node files); grade scores
  deterministically (mcq vs `correctIndex`; short: non-empty ⇒ correct) — so both the pass
  AND fail paths are demoable offline.

### Frontend env
`NEXT_PUBLIC_API_URL` (default `http://localhost:8000`), `NEXT_PUBLIC_CLIENT_MOCK`
(optional `true` → `lib/api.ts` returns local fixtures, never hits the network).

---

## Implementation steps

### Phase A — Scaffold, contracts & seed content

- **A1 — Commit `PLAN.md`** *(Orchestrator — this document)* ✅
  **Done when:** this file is committed on `graph`.

- **A2 — Scaffold frontend** · *Sonnet* · Needs A1 · ∥ A3
  **Owns:** `frontend/**` (new app)
  `create-next-app` (TS, App Router, Tailwind, ESLint). Install ALL frontend deps now
  (`@xyflow/react`, `@dagrejs/dagre`, `vitest`) — no later step touches `package.json`.
  Add Tailwind state tokens (`unlit` slate, `lit` amber glow, `mastered` emerald, `locked`
  dimmed) and `frontend/.env.example` (`NEXT_PUBLIC_API_URL=http://localhost:8000`).
  **Done when:** `npm run dev` serves the default page; `npx tsc --noEmit` and `npx vitest run` pass.

- **A3 — Scaffold backend** · *Sonnet* · Needs A1 · ∥ A2
  **Owns:** `backend/**` (new app)
  FastAPI skeleton: `main.py` with `GET /health` → `{"status":"ok"}`, CORS for
  `http://localhost:3000`; `requirements.txt` (`fastapi`, `uvicorn`, `anthropic`,
  `python-dotenv`, `pydantic`); `.env.example` (`ANTHROPIC_API_KEY=`, `MOCK_MODE=true`).
  **Done when:** `uvicorn main:app` starts; `curl localhost:8000/health` returns ok.

- **A4 — Freeze contracts** · *Orchestrator* · Needs A2
  **Owns:** `frontend/lib/types.ts`, `seed-data/graphs.json`
  Write `types.ts` mirroring §Contracts exactly (Graph, GraphNode, Resource, Sponsor,
  NodeTest, NodeState, Progress, Question union, all four API request/response types).
  Write a 3-node **stub** math graph (`arithmetic → algebra → functions`, real summaries
  ≥ 120 chars) — every later step develops against this stub; full content lands in A6/A7.
  **Done when:** `npx tsc --noEmit` passes; stub matches the schema by inspection.

- **A5 — Seed validator** · *Sonnet* · Needs A4 · ∥ B1,B2,B3,B5,C2,D1,D5,D6,E1
  **Owns:** `frontend/lib/validateGraph.ts`, `frontend/lib/__tests__/seed.test.ts`
  Pure `validateGraph(g)` → error list: duplicate node ids; edge endpoints that don't
  exist; self-loops; cycle detection via topological sort; `summary` < 120 chars; warn on
  `hidden`/`unlockedBy`. Test runs it over the real `graphs.json` AND over inline broken
  fixtures (cycle, dangling edge) that must fail.
  **Done when:** `npx vitest run` green; the broken fixtures are rejected.

- **A6 — Author the full Math seed** · *Sonnet (content lane)* · Needs A5
  **Owns:** `seed-data/graphs.json` (expand the math entry)
  ~12 nodes with real branching: `Arithmetic → Algebra → Functions → {Trigonometry,
  Sequences} → Limits → Calculus → Differential Equations` plus `Linear Algebra` and
  `Probability` branches so it *looks* like a tree. Real public URLs (3Blue1Brown, MIT OCW,
  OpenStax, Khan); substantive 150–250-word summaries (they are the quiz ground truth);
  sponsors on ~half the nodes (the optional-sponsor rendering needs both cases).
  **Done when:** `npx vitest run` (A5 validator) passes against the new seed.

- **A7 — Biology mini-seed** · *Sonnet (content lane)* · Needs A6
  **Owns:** `seed-data/graphs.json` (append second graph)
  5–6 nodes including **Photosynthesis** — ties the graph demo to the existing
  Hindi/Photosynthesis pitch (`docs/BRIEF.md`) and proves multi-graph for ~zero engine cost.
  **Done when:** validator passes; landing (E1) will list both graphs.

### Phase B — Graph engine & canvas (frontend; stub seed; no backend)

- **B1 — Progression logic** · *Sonnet* · Needs A4 · ∥ B2,B3,B5
  **Owns:** `frontend/lib/progression.ts`, `frontend/lib/__tests__/progression.test.ts`
  Pure functions only: `unlockedSet(graph, progress)`, `displayState(node, progress,
  unlocked)` (applies §Contracts precedence), `completion(graph, progress)` → `{mastered,
  total}` counted from the seed. No storage, no React. This is the riskiest logic — tests
  first: root unlocked; child locked until ALL prereqs mastered; multi-prereq node; unknown
  ids in progress ignored; mastered node never displays locked.
  **Done when:** `npx vitest run` green with those cases.

- **B2 — Progress store hook** · *Sonnet* · Needs A4 · ∥ B1,B3,B5
  **Owns:** `frontend/lib/useGraphProgress.ts`
  `useGraphProgress(graphId)` → `{ progress, setNodeState(id, state), reset() }`
  implementing §Contracts → Progress storage exactly (key versioning, useEffect-only reads,
  try/catch parse, ignore unknown ids). Returns `{}` until hydrated.
  **Done when:** `npx tsc --noEmit` passes; manual check in a scratch page or test: write →
  refresh persists → reset clears → corrupted key (`localStorage.setItem(key, "{{")`) doesn't crash.

- **B3 — Dagre layout** · *Sonnet* · Needs A4 · ∥ B1,B2,B5
  **Owns:** `frontend/lib/layout.ts`
  `layoutGraph(graph)` → positioned React Flow nodes/edges using `@dagrejs/dagre`, rankdir
  `TB`, fixed `NODE_W`/`NODE_H` constants (dagre requires dimensions up front). Edges get
  `markerEnd` arrowheads. Pure function — no rendering.
  **Done when:** `npx tsc --noEmit`; a vitest case asserts the stub's 3 nodes get distinct,
  top-down-ordered positions.

- **B4 — Canvas page (default nodes)** · *Sonnet* · Needs B3
  **Owns:** `frontend/app/graph/[id]/page.tsx`
  `"use client"` page: find graph by id in the seed (unknown id → `notFound()`), run
  `layoutGraph`, render `<ReactFlow>` with React Flow's **default** node type for now.
  Gotchas (all mandatory): full-height container (`h-screen` wrapper — the canvas renders
  blank without explicit height); import `@xyflow/react/dist/style.css`;
  `nodesDraggable={false}` `nodesConnectable={false}` `fitView`.
  **Done when:** `/graph/math` shows the 3-node stub with arrowed edges, pan/zoom works;
  `/graph/nope` 404s.

- **B5 — SkillNode visuals** · *Sonnet* · Needs A4 · ∥ B1,B2,B3 (component-only, fixture-driven)
  **Owns:** `frontend/components/graph/SkillNode.tsx`
  Custom React Flow node: renders title + concept, target handle top / source handle
  bottom, and the four visual states from props using the A2 tokens — `unlit` (slate),
  `lit` (amber glow), `mastered` (emerald + ✓), `locked` (dimmed + lock icon). No logic.
  **Done when:** `npx tsc --noEmit`; all four states visibly distinct (screenshot or a
  scratch render of four instances).

- **B6 — Wire states into the canvas** · *Sonnet* · Needs B1,B2,B4,B5
  **Owns:** `frontend/app/graph/[id]/page.tsx` (edit)
  Register `SkillNode` as the node type; per render compute `unlockedSet` + `displayState`
  and feed each node its state; style edges by source state (edge from a `mastered` source =
  highlighted "open path"). Clicking only records the selected node id for now (panel = C1).
  **Done when:** hand-seeding localStorage (e.g. arithmetic=mastered) then refreshing shows:
  arithmetic emerald, algebra unlocked-unlit, functions locked-dimmed; clearing storage
  shows root unlocked + rest locked.

- **B7 — HUD: completion, reset, legend** · *Sonnet* · Needs B6
  **Owns:** `frontend/components/graph/GraphHud.tsx`, `frontend/app/graph/[id]/page.tsx` (edit)
  Overlay panel: `X / Y mastered` progress bar (totals from seed via `completion()`),
  **Reset progress** button (calls `reset()`, instant — it's a demo affordance), and a
  4-state legend.
  **Done when:** mastering via hand-seeded storage increments the bar; Reset returns the
  tree to its initial state without a reload.

### Phase C — Node detail panel (reuses the planned "lesson view")

- **C1 — NodePanel** · *Sonnet* · Needs B7, C2
  **Owns:** `frontend/components/graph/NodePanel.tsx`, `frontend/app/graph/[id]/page.tsx` (edit)
  Slide-over drawer on node click: title, concept, level, `estimatedMinutes`, summary,
  resource list (C2 cards), **sponsor badge** ("This topic is free thanks to [Sponsor]. —
  [tagline]", rendered only if `sponsor` present). Interaction rules (from §Contracts):
  opening an unlocked `unlit` node sets it `lit`; opening a **locked** node shows the panel
  read-only with "Master **[prereq titles]** to unlock" instead of the CTA and must NOT set
  `lit`; `lit` shows **"Take test to master"** (CTA stub: `onTakeTest` callback, wired in
  D7); `mastered` shows a ✓ "Mastered" badge and no CTA.
  **Done when:** all four open-states behave per spec; the lit transition persists across refresh.

- **C2 — ResourceCard** · *Sonnet* · Needs A4 · ∥ B1–B5 (component-only)
  **Owns:** `frontend/components/graph/ResourceCard.tsx`
  Variants by `type` (video / book / article): icon, title, `source` byline, `duration`
  when present. **Plain external links** (`target="_blank" rel="noopener noreferrer"`) —
  deliberately NO YouTube iframes (hackathon WiFi + cookie walls kill embeds).
  **Done when:** `npx tsc --noEmit`; the three variants render distinctly with stub data.

### Phase D — AI mastery test (backend lane ∥ quiz-UI lane; converge at D7)

*Backend lane (one Sonnet agent, sequential D1→D2→D3→D4 — they share `main.py`). Starts
right after A3+A4; runs concurrently with all of Phase B/C.*

- **D1 — Seed loading + mock generate** · *Sonnet (BE lane)* · Needs A3, A4
  **Owns:** `backend/seed.py`, `backend/mocks.py`, `backend/main.py` (edit)
  `seed.py`: load `graphs.json` via `Path(__file__).parent.parent / "seed-data"` (robust to
  cwd), **fail fast at startup** if missing/invalid; `get_node(graph_id, node_id)` → node or
  `None`. `mocks.py`: `mock_questions(node)` templates `node.test.numQuestions` questions
  from the node's own title/summary (3 mcq with a known `correctIndex` + 1 short) — works
  for **any** node, no canned files. Route `POST /api/test/generate` per §Contracts:
  `MOCK_MODE` (default true) → mock; unknown ids → 404.
  **Done when:** offline, `curl` generate for **two different** stub nodes returns valid,
  node-specific `Question[]`; unknown node → 404.

- **D2 — Mock grade** · *Sonnet (BE lane)* · Needs D1
  **Owns:** `backend/main.py` (edit), `backend/mocks.py` (edit)
  Route `POST /api/test/grade` per §Contracts. Deterministic scorer (used by mock mode AND
  later as the live MCQ path): mcq correct ⇔ `answer == question.correctIndex`; short
  correct ⇔ non-empty (mock rule); `score` = fraction; `passed = score >=
  node.test.passThreshold`; per-question feedback strings.
  **Done when:** offline, one curl with right answers → `passed:true`, one with wrong →
  `passed:false` — the fail path is demoable with no network.

- **D3 — Live generation (Claude)** · *Sonnet (BE lane)* · Needs D2
  **Owns:** `backend/prompts.py`, `backend/llm.py`, `backend/main.py` (edit)
  `prompts.py`: `TEST_GENERATION_SYSTEM` constant — questions grounded STRICTLY in the node
  summary, mostly mcq + 1–2 short, written in `language`. `llm.py`: Pydantic models
  mirroring §Contracts; call `claude-sonnet-4-6` via the Python SDK with **structured
  outputs** (`client.messages.parse(..., output_format=GeneratedTest)`) — no hand-parsing,
  no markdown fences possible; `max_tokens≈2000`, request timeout ~30s; any SDK error or
  validation failure → `502` (never a silent fallback).
  **Done when:** with `ANTHROPIC_API_KEY` set and `MOCK_MODE=false`, generate returns
  schema-valid questions grounded in the stub summary; with a bogus key → clean 502 JSON.

- **D4 — Live grading (hybrid)** · *Sonnet (BE lane)* · Needs D3
  **Owns:** `backend/prompts.py` (edit), `backend/llm.py` (edit), `backend/main.py` (edit)
  Live mode grade: **MCQ scored deterministically in Python** (reuse the D2 scorer); only
  the short answers go to Claude — one structured-outputs call with the node summary +
  question/answer pairs → per-question `correct` + `feedback` ("student may answer in any
  language"). Merge into the §Contracts response; same 502 discipline.
  **Done when:** live curl with a deliberately good and a deliberately bad short answer
  grades both plausibly; mcq scoring provably bypasses Claude (an mcq-only grade request
  succeeds with zero Claude calls — verify by log or by unit-calling the scorer).

*Quiz-UI lane (frontend; parallel with the backend lane and Phase B).*

- **D5 — API client** · *Sonnet (FE-components lane)* · Needs A4 · ∥ everything FE
  **Owns:** `frontend/lib/api.ts`
  Typed `generateTest(req)` / `gradeTest(req)` fetchers; base URL from
  `NEXT_PUBLIC_API_URL`; non-2xx → typed `ApiError` with the `detail` message;
  `NEXT_PUBLIC_CLIENT_MOCK=true` → return local fixtures without any network (the last link
  in the demo fallback chain).
  **Done when:** `npx tsc --noEmit`; client-mock mode returns fixtures with the backend down.

- **D6 — QuizModal (fixture-driven)** · *Sonnet (FE-components lane)* · Needs A4 · ∥ B/C
  **Owns:** `frontend/components/graph/QuizModal.tsx`
  Modal fed by props/fixtures (no fetching yet): renders mcq as radio groups and short as
  textarea — **never renders `correctIndex`**; collects answers into §Contracts `items`;
  submit → result view (score, per-question ✓/✗ + feedback, overall feedback) with
  **"Retake test"** on fail; close button.
  **Done when:** with inline fixture questions + a fake grade result, the full
  answer→submit→result→retake flow works visually.

- **D7 — Wire the full mastery loop** · *Sonnet* · Needs C1, D2, D5, D6
  **Owns:** `frontend/components/graph/QuizModal.tsx` (edit), `frontend/components/graph/NodePanel.tsx` (edit)
  NodePanel CTA opens QuizModal → `generateTest` (skeleton while loading; **CTA disabled
  while a request is in flight** — no double-fire) → submit → `gradeTest` → on `passed`:
  `setNodeState(nodeId, "mastered")`, close modal, canvas re-derives unlocks (the visual
  cascade); on fail: node stays `lit`, show feedback + Retake; on API error: **in-modal**
  error + Retry that preserves the student's answers (never close-and-lose).
  **Done when:** against `MOCK_MODE=true` backend: pass → node turns emerald and the
  dependent unlocks; fail path shows feedback; refresh persists; kill the backend → in-modal
  error + retry works.

- **D8 — Hindi insurance (equity moment)** · *Sonnet* · Needs D4, D7 (shares `llm.py`/`prompts.py` with D4)
  **Owns:** `backend/prompts.py` (edit), `backend/llm.py` (edit), `frontend/components/graph/QuizModal.tsx` (edit)
  Thread the §Contracts `language` field end-to-end: generation prompt writes the questions
  in the requested language; QuizModal gets a small 🌐 `en | hi` toggle that regenerates.
  ~15 minutes of work that keeps the pitch's "opportunity isn't equal" narrative
  (`PROBLEMS.md` P1.2, `docs/BRIEF.md` Act 1) alive inside the graph demo: *"she takes the
  Photosynthesis quiz in Hindi."*
  **Done when:** live-mode generate with `"language":"hi"` returns Hindi questions; the
  toggle round-trips in the UI; mock mode simply ignores the field.

### Phase E — Landing, polish & ship

- **E1 — Landing page** · *Sonnet* · Needs A4 · ∥ B/C/D (own file)
  **Owns:** `frontend/app/page.tsx`
  Pick-a-roadmap screen: map over ALL graphs in the seed (Math + Biology once A7 lands) —
  title, subject, one-line description, node count → link to `/graph/[id]`. Tagline from
  `README.md`.
  **Done when:** both seeded graphs listed and navigable.

- **E2 — States & responsiveness polish** · *Sonnet* · Needs D7
  **Owns:** frontend component/page edits (run alone — broad ownership)
  Loading skeletons everywhere a wait exists (< 2s perceived, per `META-PROMPT.md`); error
  / empty states ("Something went wrong. Try again." — never raw errors); mobile-readable
  panel + landing (canvas itself is a desktop demo).
  **Done when:** throttled-network walkthrough shows skeletons, not spinners or jank.

- **E3 — Animations** · *Sonnet* · Needs E2 (serialize — same files)
  **Owns:** frontend component/page edits
  Node light-up transition on `lit`; unlock ripple on the dependents when a node is
  mastered; small celebration on quiz pass (CSS only — adding a confetti dep would touch
  `package.json` → orchestrator decision).
  **Done when:** master a node in mock mode → pass feels like a moment (smooth state
  transitions, dependents visibly "switch on").

- **E4 — Docs sync** · *Sonnet* · Needs D7 · ∥ E2/E3
  **Owns:** `README.md`, `project_state.md`
  The repo's docs still describe the search-first MVP — teammates and judges will read
  stale instructions. Update README (quick-start incl. `MOCK_MODE`, new Build Order =
  phases A–F, what's mocked vs real) and `project_state.md` (graph-branch statuses). Flag
  for Person 4: the pitch's Teacher actor is now institutional `source` credibility —
  `docs/BRIEF.md` narrative needs a pitch-side update (not a code change).
  **Done when:** a fresh clone can run both apps from README alone.

- **E5 — Demo-prep checklist** · *Orchestrator + human* · Needs E2
  No code. (1) Record the 90-second Loom backup (`PROBLEMS.md` P3.7) and keep it open in a
  tab; (2) rehearse the `MOCK_MODE` flip and the Reset-between-demos flow; (3) optional:
  deploy frontend to Vercel with `NEXT_PUBLIC_CLIENT_MOCK=true` as a zero-backend backup
  demo URL; (4) state the success metric to judges up front (`PROBLEMS.md` P3.10).
  **Done when:** the demo has survived one full dry run on mock with the WiFi off.

### Phase F — Stretch (ONLY after E2; `ideas.md` flags these as later)

- **Hidden nodes / discovery** (`hidden` + `unlockedBy`): node stays off-canvas until its
  unlock condition is met, then reveal-animates in. Layout note: run dagre **with hidden
  nodes included** so a reveal doesn't reshuffle the whole tree.
- **Search-to-node:** reuse the architecture's `/api/match` idea — query → Claude → jump to
  + highlight the matching node (lets the Hindi search demo plug into the graph).
- **Follow-up Q&A in the node panel:** reuse the search-MVP `/api/followup`, scoped to the
  node summary.
- **Cross-subject edge (hypergraph teaser):** one edge between the Math and Biology graphs
  to demo interdisciplinarity (the Biology graph itself already landed in A7).
- **AI clips / translation of sources** (`ideas.md` "Sources"): Claude-generated short
  preview or translated caption for a resource.

---

## Suggested schedule (Opus 4.8 orchestrator waves)

| Wave | Running in parallel (lane → steps) |
|---|---|
| 0 | Orchestrator: A1 commit |
| 1 | A2 ∥ A3 |
| 2 | Orchestrator: A4 (contracts freeze) |
| 3 | **FE-engine:** B1→B2→B3→B4→B6→B7 · **FE-components:** B5→C2→D6→D5→E1 · **Backend:** D1→D2→D3→D4 · **Content:** A5→A6→A7 |
| 4 | C1 (FE-engine lane) — then **D7** (the convergence step) |
| 5 | D8 ∥ (E2→E3) ∥ E4 |
| 6 | E5 dry run · Phase F with remaining time |

Critical path: A2→A4→B1→B4→B6→B7→C1→D7→E2. The app is **demoable after C1** (navigate +
light nodes, all offline) even if the D lanes slip; D7 is the differentiator.

## Rough timeline (1 hackathon day, with parallel lanes)
- Waves 0–2 (scaffold + contracts): ~45 min
- Wave 3 (four lanes in parallel): ~2 h wall-clock ← first "wow" lands mid-wave (B6: interactive tree)
- Wave 4 (C1 + D7 integration): ~45 min ← the Claude moment
- Wave 5 (polish + Hindi + docs): ~1 h
- Wave 6 (dry run + stretch): remaining time

---

## Verification (end-to-end)

**Backend (mock first, then live):**
```bash
cd backend && pip install -r requirements.txt
MOCK_MODE=true uvicorn main:app --reload          # offline-safe, default mode
# generate works for ANY node, not just one demo node:
curl -X POST localhost:8000/api/test/generate -H 'Content-Type: application/json' \
  -d '{"graph_id":"math","node_id":"algebra"}'
# grade echoes the served questions back (stateless server); test BOTH outcomes offline:
curl -X POST localhost:8000/api/test/grade -H 'Content-Type: application/json' \
  -d '{"graph_id":"math","node_id":"algebra","items":[{"question":{"id":"q1","type":"mcq","prompt":"...","options":["a","b"],"correctIndex":0},"answer":0}]}'   # → passed:true
#   ...same with "answer":1 → passed:false
curl -X POST localhost:8000/api/test/generate -H 'Content-Type: application/json' \
  -d '{"graph_id":"math","node_id":"nope"}'        # → 404
# then MOCK_MODE=false with ANTHROPIC_API_KEY set → structured outputs validate; add
# "language":"hi" → Hindi questions (D8).
```

**Frontend + full loop:**
```bash
cd frontend && npm install && npm run dev
```
1. Landing lists Math + Biology → open `/graph/math`.
2. Tree renders: root (`Arithmetic`) unlocked; downstream nodes **locked** (dimmed + lock).
3. Click a **locked** node → read-only panel, "Master […] to unlock", node does NOT turn lit.
4. Click `Arithmetic` → panel opens, node turns **lit**, persists across refresh; resources
   open in new tabs; sponsor badge shows only where the seed has a sponsor.
5. "Take test" → CTA disables, skeleton, questions load → submit wrong answers → **fail**
   path: stays lit, feedback + Retake → submit right answers → **pass**: node turns
   **mastered**, dependents unlock with animation, completion bar increments.
6. Refresh → progress persists. **Reset** clears it without reload.
7. Kill the network, `MOCK_MODE=true` → steps 4–6 all still work, including the fail path.
8. Kill the backend entirely, `NEXT_PUBLIC_CLIENT_MOCK=true` → quiz still demoable.
9. (If Phase F) mastering the gating node reveals a hidden node.

**Unit checks:** `progression.test.ts` (root unlocked; child locked until ALL prereqs
mastered; precedence; completion math; unknown ids ignored) and `seed.test.ts` (real seed
valid; cycle/dangling-edge fixtures rejected).

---

## Content decision (resolved)
Hero seed is **Mathematics** (matches `ideas.md`'s Calculus→DiffEq chain and shows
dependency structure beautifully). The pitch's **Hindi/Biology/Photosynthesis** moment is
covered without swapping: the **Biology mini-graph ships in A7** (content-only, same
engine) and the **quiz-in-Hindi toggle ships in D8** — the demo gets both the gorgeous
tree *and* the equity story.
