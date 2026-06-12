# LearnBridge — Team Roles (4 People)

## Role Split

| Person | Role | Owns | Does NOT touch |
|---|---|---|---|
| **Eshaan** | Design + Web App + Git | UI/UX, Next.js frontend, Tailwind, repo management, deployment | Backend logic, AI prompts, seed data |
| **Person 2** | Interactive Learning | Lesson view UX, Q&A chat component, follow-up flow, lesson card interactions | Backend API, design system |
| **Person 3** | Backend + AI | FastAPI endpoints, Claude API integration, match logic, follow-up prompt | Frontend, design |
| **Person 4** | Content + Research + Pitch | Seed data (lessons.json), competitive research, business model slide, pitch narrative | Code |

---

## Eshaan's Workstream (Design + Web App + Git)

**Owns:**
- Figma/design direction (or direct Tailwind if no time for Figma)
- Next.js App Router setup and folder structure
- Home page (search input)
- Results page (lesson card grid layout)
- Lesson page (shell — video placeholder, sponsor bar, chat slot)
- Tailwind design system (colors, typography, spacing)
- GitHub repo init + branch strategy
- Vercel deploy

**Hands off to:**
- Person 2: the Q&A chat component (drop it into the lesson page slot)
- Person 3: API calls (Eshaan stubs them with mock data until backend is ready)

**Git strategy:**
- main = always deployable
- feature branches: `feat/search`, `feat/lesson-view`, `feat/results`
- Person 2 works on `feat/qa-chat` — Eshaan reviews + merges
- Person 3 works on `/backend` folder — separate from frontend

---

## Person 2 — Interactive Learning

**Owns:**
- Q&A chat component (input → POST /api/followup → streaming response)
- Lesson card hover/click interactions
- "Still confused?" prompt reveal animation
- Follow-up message history display (last 3 exchanges only, no full history)
- Loading skeleton for chat response

**Depends on:**
- Person 3's /api/followup endpoint (use mock until it's ready)
- Eshaan's lesson page layout (slot to drop the chat component into)

**Delivers:**
- `frontend/components/QAChat.tsx`
- `frontend/components/LessonCard.tsx` (interactive version)

---

## Person 3 — Backend + AI

**Owns:**
- FastAPI app setup (`/backend/main.py`)
- POST /api/match — Claude language detection + lesson matching
- POST /api/followup — Claude Q&A scoped to lesson content
- MOCK_MODE env flag (both endpoints return seed data when on)
- Claude prompt files (`/backend/prompts.py`)
- CORS configuration for local frontend dev

**Depends on:**
- lessons.json from Person 4 (mock with 3 hardcoded lessons until it arrives)

**Delivers:**
- `/backend/main.py`
- `/backend/prompts.py`
- `/backend/mock_responses/match.json`
- `/backend/mock_responses/followup.json`
- `/backend/requirements.txt`

**Key constraints:**
- /api/followup system prompt MUST scope Claude to lesson content only
- Test Hindi input specifically before integration
- Default to MOCK_MODE=true until demo day

---

## Person 4 — Content + Research + Pitch

**Owns:**
- `seed-data/lessons.json` — 20 lessons, 4 subjects, diverse teachers + sponsors
- `docs/research.md` — competitive landscape, 3 differentiators vs Khan Academy
- `docs/pitch-prep.md` — business model numbers, judge Q&A answers, backup narrative
- Sponsor logo placeholders (simple SVG or colored divs with company names)

**Depends on:**
- Nothing — can start immediately

**Delivers (in order):**
1. lessons.json (Person 3 needs this by T+1h)
2. research.md (helps everyone with pitch framing)
3. pitch-prep.md (needed by T+4h for practice)

---

## Dependency Map

```
Person 4 → lessons.json
                ↓
Person 3 → /api/match + /api/followup
                ↓
Eshaan   → results page wired to real API
Person 2 → Q&A chat wired to /api/followup
```

Everything Person 4 does is unblocked. Start immediately.
Person 3 can start with 3 hardcoded lessons without waiting for Person 4.
Eshaan stubs API calls with mock JSON until Person 3's endpoints are live.
Person 2 builds the chat component against MOCK_MODE endpoints.

---

## Timeline (hackathon day)

| Time | Eshaan | Person 2 | Person 3 | Person 4 |
|---|---|---|---|---|
| 0–1h | Repo setup, design system, home page | Q&A chat component (mock) | FastAPI setup, mock endpoints | lessons.json (start) |
| 1–2h | Results page (lesson cards) | Lesson card interactions | /api/match logic | lessons.json (finish) + research.md |
| 2–3h | Lesson page shell | Wire chat to MOCK endpoint | /api/followup + Hindi test | pitch-prep.md |
| 3–4h | Wire results page to real /api/match | Wire chat to real /api/followup | QA + fix Hindi edge cases | Sponsor assets |
| 4–5h | Polish, Vercel deploy | Final Q&A polish | End-to-end test | Pitch rehearsal |

---

## Hermes + Claude Code Support

**Claude Code (Eshaan uses during session):**
- Architecture decisions and code review
- Any component Eshaan wants generated
- Integration debugging
- QA testing scripts

**Hermes (Eshaan can spin up in parallel):**
- Generates lessons.json if Person 4 is slow
- Drafts pitch-prep.md
- Writes any boilerplate code Person 3 needs
