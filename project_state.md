# LearnBridge — Project State (branch: `graph`)

## COMPLETE

### Phase A — Scaffold & contracts
- [x] A1 — PLAN.md committed
- [x] A2 — Frontend scaffold (Next.js 14, App Router, TS, Tailwind, React Flow, Dagre, Vitest)
- [x] A3 — Backend scaffold (FastAPI, `/health`, CORS, requirements.txt, .env.example)
- [x] A4 — Contracts frozen (`frontend/lib/types.ts`, `seed-data/graphs.json` dev fixture)
- [x] A5 — Seed validator (`validateGraph.ts`, `__tests__/seed.test.ts`)

### Phase B — Graph engine & canvas
- [x] B1 — Progression logic (`progression.ts`, `__tests__/progression.test.ts`)
- [x] B2 — Progress store hook (`useGraphProgress.ts` — localStorage, SSR-safe)
- [x] B3 — Dagre layout (`layout.ts`)
- [x] B4 — Canvas page (`app/graph/[id]/page.tsx` — React Flow, default nodes)
- [x] B5 — SkillNode visuals (4 states: unlit/lit/mastered/locked)
- [x] B6 — Wire states into canvas (SkillNode registered, displayState per node, edge highlighting)
- [x] B7 — HUD: completion bar, Reset button, legend (`GraphHud.tsx`)

### Phase C — Node detail panel
- [x] C1 — NodePanel slide-over (all 4 open-states, lit transition, sponsor badge, CTA stub)
- [x] C2 — ResourceCard (video/book/article variants, external links)

### Phase D — AI mastery test
- [x] D1 — Seed loading + mock generate (`seed.py`, `mocks.py`, `POST /api/test/generate`)
- [x] D2 — Mock grade (`POST /api/test/grade`, deterministic pass/fail, demoable offline)
- [x] D3 — Live generation via Claude (`prompts.py`, `llm.py`, structured outputs on `claude-sonnet-4-6`)
- [x] D4 — Live grading hybrid (MCQ deterministic in Python, short answers via Claude)
- [x] D5 — API client (`lib/api.ts` — typed fetchers, `NEXT_PUBLIC_CLIENT_MOCK` fallback)
- [x] D6 — QuizModal fixture-driven (MCQ radios, short textarea, result view, Retake)
- [x] D7 — Full mastery loop wired (NodePanel CTA → generate → submit → grade → mastered/fail/error)

### Phase E — Real subject content
- [x] E1 — Mathematics hero graph (~12 nodes: Arithmetic → DiffEq + Linear Algebra + Probability)
- [x] E2 — Biology mini-graph (5 nodes including Photosynthesis)

### Phase F — Landing, polish & ship
- [x] F1 — Landing page (lists all seeded graphs, navigates to `/graph/[id]`)
- [x] F2 — States & responsiveness polish (quiz loading skeleton, error banners, mobile panel/landing)
- [x] F3 — Animations (node light-up, unlock cascade ripple, quiz-pass celebration)
- [x] F4 — Docs sync (README + project_state updated to reflect graph-branch reality)

## IN PROGRESS

*(none)*

## TODO / OPTIONAL

- [ ] F5 — Demo-prep checklist (Loom backup, mock-mode dry run, optional Vercel deploy)
- [ ] D8 — Hindi quiz toggle (`language` field end-to-end; `MOCK_MODE` ignores it)
- [ ] Live-key verification — live Claude path is implemented but unverified without a real key
- [ ] Phase G stretch: hidden/discovery nodes, search-to-node, follow-up Q&A, cross-subject edge

## BLOCKERS

*(none)*

## NEXT ACTION

App is demoable end-to-end on `MOCK_MODE=true`, with polish + animations in place. Recommended next steps:
1. F5 dry run (WiFi off, mock mode, Reset between runs).
2. D8 Hindi toggle if time permits — keeps the pitch equity story live.
3. Live-key verification once an `ANTHROPIC_API_KEY` is available.
4. Optional: verify D3/D4 live path with a real `ANTHROPIC_API_KEY`.

## Notes for the pitch

- The Teacher actor from the original search-MVP pitch has become **institutional source
  credibility**: curated resources from 3Blue1Brown, Khan Academy, MIT OCW, OpenStax, etc. The
  sponsor badge on each node keeps the business-model story alive. `docs/BRIEF.md` narrative
  may want a pitch-side update to reflect this (not a code change — Person 4).
- The Hindi/Photosynthesis equity moment from `docs/BRIEF.md` Act 1 is preserved: Biology E2
  includes Photosynthesis; D8 adds the `🌐 en | hi` toggle to the QuizModal.
- Demo fallback chain: live Claude → `MOCK_MODE=true` → `NEXT_PUBLIC_CLIENT_MOCK=true`.
