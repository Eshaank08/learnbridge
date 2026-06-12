# LearnBridge

**Free, expert-taught education for any student, anywhere, in any language — funded by companies who want to reach them.**

🌐 **Live:** https://learnbridge-eshaank08s-projects.vercel.app

📎 **Pitch deck:** [LearnBridge-Overview.pptx](./LearnBridge-Overview.pptx) · [LearnBridge-Overview.pdf](./LearnBridge-Overview.pdf)

Built for the **Claude Builders Club Hackathon** — Theme: Education

---

## The Problem

300 million students are locked out of quality education by three walls:

- **Geography** — no good teachers nearby
- **Wealth** — can't afford tuition
- **Language** — content exists but not in their language

## What LearnBridge Does

A student types any question, in any language. Claude detects the language, subject, and concept, then matches them to the best expert-taught course from our catalog. They watch real YouTube-embedded lectures, read research papers, and get guided by an AI Socratic tutor that never gives away answers — only asks better questions.

Sponsors fund the courses. Students never pay.

---

## Features

### For Students
- **AI Course Match** — type a question in any language, Claude matches you to the right course
- **20 expert-taught courses** — Computer Science, Biology, Math, History, Physics, Chemistry, Economics, Data Science, Psychology, Philosophy, Environmental Science, Creative Writing, Public Health, Business, Art History, Spanish, and more
- **Embedded YouTube lectures** — real videos from MIT OpenCourseWare, Khan Academy, Harvard CS50, and others
- **Split-panel learn view** — video + materials on the left, AI tutor always visible on the right
- **AI Guide sidebar** — Socratic tutor asks questions, never gives direct answers
- **AI Quiz mode** — Claude generates 3 questions per lecture, evaluates your answers, scores you
- **Course outline with topic search** — type what you want to learn, get the right chapter + timeframe
- **Learning goals tracker** — checkmarks tick off as you progress
- **Offline download mockup** — shows the offline-first roadmap
- **Certificate on completion** — per-course certificates

### For Teachers
- **Teacher dashboard** — apply to teach, see student reach and earnings
- `/teach` — full landing page with how-it-works and apply form

### For Everyone
- **Live tutor matching** — browse 12 available tutors, request a session
- **Multilingual AI pipeline** — shows the Whisper → Claude → ElevenLabs translation stack
- **Business model transparency** — three-actor model (Student / Teacher / Sponsor) explained on the landing page

---

## Demo Flow

1. Go to [learnbridge-eshaank08s-projects.vercel.app](https://learnbridge-eshaank08s-projects.vercel.app)
2. Type a question in the search bar — try *"मुझे photosynthesis समझाओ"* or *"how do neural networks learn"*
3. Claude matches you to a course — click it
4. On the course page, expand a lecture → click **Start this lecture**
5. Watch the embedded video on the left
6. On the right: use the **Guide** tab to ask the AI tutor questions (it won't give direct answers)
7. Switch to **Quiz me** → Claude generates questions, you answer, get feedback
8. Search a topic in the outline (e.g. "sorting") → see the best-matching chapter highlighted
9. Mark lectures complete — watch learning goals tick off

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| AI | Claude API (`claude-sonnet-4-6`) via Anthropic SDK |
| UI Components | Magic UI (AnimatedShinyText, NumberTicker, BlurFade, Marquee, BorderBeam) |
| Animation | Framer Motion (`motion/react`) |
| Auth | Supabase (optional, not required to start learning) |
| Deployment | Vercel |
| Data | Static JSON (`public/courses.json`, `public/tutors.json`) |

---

## AI Usage

| Feature | How Claude is used |
|---|---|
| Course match | Detects language + subject from free-text query, maps to course catalog |
| Socratic tutor | Phase-aware dialogue — one question at a time, never gives direct answers |
| Quiz generation | Generates 3 open-ended questions per lecture based on content summary |
| Quiz evaluation | Evaluates student answers, gives 1-2 sentence feedback + pass/fail |
| Follow-up Q&A | Answers questions strictly from lecture context |

---

## Run Locally

```bash
git clone https://github.com/Eshaank08/learnbridge.git
cd learnbridge/frontend
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
# Optional — set to "true" to run without calling Claude
MOCK_MODE=false
```

```bash
npm run dev
# open http://localhost:3000
```

No backend needed. Everything runs through Next.js API routes.

---

## Project Structure

```
learnbridge/
├── frontend/               # Next.js app
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── courses/        # Course listing + detail
│   │   ├── learn/          # Split-panel lecture viewer
│   │   ├── results/        # AI match results + tutor matching
│   │   ├── tutors/         # Live tutor directory
│   │   ├── teach/          # Teacher landing + dashboard
│   │   └── api/
│   │       ├── match/      # Language detection + course matching
│   │       ├── tutor/      # Socratic AI tutor
│   │       ├── quiz/       # Quiz generation + answer evaluation
│   │       └── followup/   # Lecture Q&A
│   ├── components/
│   │   ├── sidebar/        # AIPanel (guide + quiz), AISidebar (mobile drawer)
│   │   ├── tutors/         # TutorCard
│   │   └── ui/             # Magic UI components
│   └── public/
│       ├── courses.json    # 20 courses with lectures, materials, teachers, sponsors
│       └── tutors.json     # 12 live tutors
└── docs/                   # Architecture, pitch prep, business model
```

---

## Roadmap (post-hackathon)

- [ ] Real multilingual dubbing pipeline (Whisper → Claude → ElevenLabs)
- [ ] Sponsor dashboard with student reach analytics
- [ ] True offline mode (service worker + cached video)
- [ ] Teacher upload and review workflow
- [ ] Live tutor video sessions (WebRTC)
- [ ] Mobile app (React Native)

---

## Team

**Eshaan Kansal** — [GitHub](https://github.com/Eshaank08)

Built with Claude Sonnet 4.6 · Anthropic Hackathon 2025
