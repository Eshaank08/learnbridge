# LearnBridge — Hackathon Operating System

## The Model

You (Eshaan) are the CEO.
Claude Code = CTO + Engineering org (architecture, code, AI integration, QA).
Hermes = Research + Content + Pitch org (data generation, competitive research, pitch material).

They work in parallel. They never speak to each other. You are the integration point.

---

## The Two Constraints

**Claude Code knows:**
- Full vision (vision.md)
- Full architecture (architecture.md)
- All task assignments

**Hermes knows:**
- Only what's needed for its specific task
- Never sees the full codebase
- Works from narrow, specific prompts

---

## Spawn Schedule

```
T+0h   [Claude Code] CTO pass — read vision.md, produce PRD + architecture + tasks.md
T+0h   [Hermes]      Research Agent — competitive landscape + 3 differentiators
T+1h   [Claude Code] AI Engineer — build /api/match + /api/followup endpoints
T+1h   [Hermes]      Content Agent — generate lessons.json (20+ lessons, 4 subjects)
T+2h   [Claude Code] Frontend Engineer — Next.js search + card + lesson view pages
T+2h   [Hermes]      Pitch Agent — business model numbers + judge Q&A prep
T+3h   [Claude Code] Integration pass — wire frontend to backend, test Hindi flow
T+3.5h [Claude Code] QA pass — mock mode, fallback responses, edge cases
T+4h   [Claude Code] Polish — sponsor badge copy, lesson card layout
T+4.5h [Hermes]      Docs Agent — README + slide talking points
```

---

## Agent Prompts

### CLAUDE CODE — CTO (spawn first, T+0h)

```
You are the CTO for LearnBridge, a hackathon MVP.

Read vision.md. Then produce:

1. PRD (prd.md) — user stories, acceptance criteria, edge cases, out of scope
2. Architecture (architecture.md) — final stack, folder structure, API contract, Claude prompt design
3. Tasks (tasks.md) — broken into Frontend / Backend / AI / QA workstreams with dependencies marked

Rules:
- Stack: Next.js 14 (App Router), Python FastAPI, Claude API (claude-sonnet-4-6)
- Mock mode flag: MOCK_MODE env var — when true, return pre-seeded responses instead of calling Claude API
- Every API endpoint must have a mock response defined before the real one is wired
- No auth, no accounts, no database — seed data from JSON files only
- Speed over perfection. MVP focused. No gold plating.

Output prd.md, architecture.md, tasks.md to /learnbridge/.
```

---

### CLAUDE CODE — AI Engineer (spawn T+1h, after architecture.md exists)

```
You are the AI Engineer for LearnBridge.

Read architecture.md. Build:

1. POST /api/match
   - Input: { query: string }
   - Claude detects: language (ISO), subject, concept, difficulty level
   - Returns: top 3 lesson matches from lessons.json (loaded at startup)
   - Matching logic: Claude returns { language, subject, concept, level } → filter + rank lessons.json
   - Mock mode: if MOCK_MODE=true, return mock_responses/match.json

2. POST /api/followup
   - Input: { question: string, lesson_id: string, lesson_summary: string }
   - Claude answers using lesson_summary as context
   - System prompt MUST include: "Only answer questions that can be answered from the lesson content. If off-topic, say: I can only help with questions about this lesson."
   - Mock mode: return mock_responses/followup.json

Deliver:
- /backend/main.py (FastAPI app)
- /backend/prompts.py (all Claude system prompts as constants)
- /backend/mock_responses/match.json
- /backend/mock_responses/followup.json
- /backend/requirements.txt
- Test command to verify both endpoints work with and without MOCK_MODE
```

---

### CLAUDE CODE — Frontend Engineer (spawn T+2h, after AI endpoints exist)

```
You are the Frontend Engineer for LearnBridge.

Read architecture.md and prd.md. Build:

Pages (Next.js App Router):
1. / (home) — single search input, no nav, no signup, tagline only
2. /results — 3 lesson cards in a grid
   - Each card: teacher name + flag emoji, subject, duration, sponsor badge (logo + tagline), language tags
   - Click → /lesson/[id]
3. /lesson/[id] — lesson view
   - Top: lesson title, teacher name, subject tag
   - Center: mock video placeholder (YouTube embed or styled div with play button)
   - Sponsor bar: logo + "This lesson is free thanks to [Sponsor]. [Tagline]."
   - Bottom: Q&A chat — input + Claude response (streamed if possible)

API calls:
- Search → POST to /api/match
- Q&A → POST to /api/followup

Design rules:
- Tailwind CSS only, no component libraries
- Clean, minimal, mobile-readable
- Sponsor badge: subtle but present — not intrusive, not hidden
- No loading spinners longer than 2s — use skeleton cards
- Error state: "Something went wrong. Try again." — never show raw errors

Deliver file list with exact paths. No placeholder TODOs in final output.
```

---

### CLAUDE CODE — Integration + QA (spawn T+3h, after frontend + backend exist)

```
You are the QA Engineer for LearnBridge.

Test the following flows end-to-end:

1. Hindi demo flow (critical):
   Input: "मुझे समझ नहीं आता कि पौधों को धूप की जरूरत क्यों है" (plants + sunlight in Hindi)
   Expected: Biology → Photosynthesis → Beginner → 3 lesson cards → lesson opens → follow-up works

2. English fallback:
   Input: "explain gravity to me"
   Expected: Physics → Gravity → returns relevant cards

3. Follow-up scope enforcement:
   After a Biology lesson, ask: "What is the GDP of Germany?"
   Expected: Claude refuses and redirects to lesson content

4. Mock mode:
   MOCK_MODE=true — verify all endpoints return mock data, no Claude API calls made

Report: what passed, what failed, what needs a fix. List exact curl commands used.
```

---

### HERMES — Research Agent (spawn T+0h, parallel with CTO)

```
Research task. Do not write any code.

Topic: Competitive landscape for AI-powered education platforms targeting underserved students.

Find:
1. Top 3 existing platforms (Khan Academy, Byju's, Coursera, etc.) — what do they do, what don't they do
2. The specific gap LearnBridge fills: multilingual + AI follow-up + sponsor-funded (free to students)
3. 3 crisp differentiator bullets for a pitch deck (max 15 words each)
4. One data point on the scale of the problem (how many students lack quality education access)

Output: a single research.md file. Bullet points only. No narrative. Max 2 pages.
```

---

### HERMES — Content Agent (spawn T+1h, parallel with AI Engineer)

```
Content generation task. Do not write any code beyond JSON.

Generate lessons.json for LearnBridge — a mock education platform.

Requirements:
- 20 lessons minimum
- 4 subjects: Biology, Physics, Mathematics, History
- 5 lessons per subject
- Each lesson includes a mix of beginner / intermediate difficulty
- Teachers should be diverse in name, country (Kenya, India, Brazil, Germany, Nigeria)
- Sponsors should be real-sounding companies appropriate to the subject (pharma → Biology, tech → Math, etc.)
- Sponsor taglines should be warm and mission-aligned, not salesy

JSON structure per lesson:
{
  "id": "bio-001",
  "title": "Photosynthesis Explained",
  "subject": "Biology",
  "concept": "Photosynthesis",
  "keywords": ["plants", "sunlight", "chlorophyll", "energy", "photosynthesis"],
  "level": "beginner",
  "duration": "8 min",
  "language": "en",
  "content_summary": "A 3-paragraph plain-text summary of what this lesson covers. Write it as if it's the lesson transcript. This is what Claude will use to answer follow-up questions.",
  "teacher": {
    "name": "Dr. Amara Osei",
    "country": "Kenya",
    "flag": "🇰🇪",
    "credentials": "PhD Botany, University of Nairobi"
  },
  "sponsor": {
    "name": "Bayer",
    "logo_placeholder": "bayer",
    "tagline": "Investing in the scientists of tomorrow."
  }
}

Output: lessons.json only. Valid JSON. No commentary.
Save to: /learnbridge/seed-data/lessons.json
```

---

### HERMES — Pitch Agent (spawn T+2h)

```
Pitch preparation task. No code.

Product: LearnBridge
Pitch: 90-second demo + 3-minute Q&A with hackathon judges

Prepare:

1. Business model slide (text):
   - CPM model estimate: cost per 1,000 lesson views
   - Example: 100K monthly views × €5 CPM = €500/month per sponsor × 10 sponsors = €5,000/month
   - Compare to: Google Display Network CPM for education audience
   - 2-3 bullet points, no more

2. Judge Q&A prep — answers to these likely questions:
   - "How is this different from Khan Academy?"
   - "Why would a company sponsor this instead of running ads?"
   - "What stops a big tech company from copying this?"
   - "How do you ensure content quality?"
   - "What's the business model long term?"

3. One backup pitch narrative (if demo breaks):
   "Let me walk you through what you would have seen..."
   Max 10 sentences. Specific. No filler.

Output: pitch-prep.md. Bullets only. No fluff.
```

---

### HERMES — Docs Agent (spawn T+4.5h)

```
Documentation task. No code.

Write the final README.md for LearnBridge hackathon submission.

Include:
- One-line pitch
- The three actors (Student, Teacher, Sponsor) in a table
- How to run locally (backend + frontend commands)
- Demo flow (the 90-second walkthrough, in steps)
- Tech stack (Next.js, FastAPI, Claude API)
- What's mocked vs what's real
- Team (Eshaan Kansal)

Tone: confident, direct, no jargon. Written for a judge who has 2 minutes.
Max 1 page.
```

---

## Project State (update as work completes)

See `project_state.md`

---

## Rules

1. Claude Code is the single source of truth for all code decisions.
2. Hermes never touches code files. It generates JSON data and markdown only.
3. You (Eshaan) review Hermes outputs before Claude Code uses them.
4. Mock mode must work before any live demo prep begins.
5. The Hindi flow must be tested before T+3.5h. If it fails, fix the prompt, not the demo.
6. If any agent produces output that contradicts architecture.md — stop and resolve before continuing.
