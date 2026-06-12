# LearnBridge — Hackathon Brief
**Event:** Claude Builders Club Hackathon
**Theme:** Education — Opportunity isn't equal.

---

## One-Line Pitch
Free, expert-taught education for any student, anywhere, in any language — funded by companies who want to reach them.

---

## The Three Actors

| Actor | Problem | What they get |
|---|---|---|
| Student | Can't afford tutors, content paywalled or wrong language | Free expert content matched to their exact problem |
| Teacher | No platform to monetize expertise beyond their classroom | Paid to create content, global reach, credibility |
| Sponsor | CSR budget to spend, needs brand visibility with students/parents | Logo on content, student reach metrics, talent pipeline |

---

## Product — Screen by Screen

**Screen 1 — Student Landing**
Single input: "What are you struggling with?" No signup required.

**Screen 2 — AI Match**
Claude parses input, detects language, identifies subject/concept, surfaces 3 most relevant lessons.
Each card: Teacher name, subject, duration, sponsor badge, language available.

**Screen 3 — Lesson View**
Video or structured text. Sponsor logo top right — subtle.
Below: "Still confused? Ask a follow-up" — Claude answers anchored to lesson content.

**Screen 4 — Teacher Profile**
Credentials, other lessons, follow button.

**Screen 5 — Sponsor Page**
"This lesson brought to you by Deutsche Bank — investing in financial futures."
All sponsor-funded content in that category.

---

## The AI Layer (Claude)

- **Certain:** Natural language understanding — student types messy, Claude understands
- **Certain:** Multilingual input — Hindi, Swahili, German, doesn't matter
- **Likely:** Intent matching — maps vague problem → specific concept → specific lesson
- **Likely:** Follow-up Q&A — student asks Claude, anchored to lesson content

---

## Demo Flow (90 seconds)

1. Student types: "I don't get why plants need sunlight" — in Hindi
2. Claude detects: Biology → Photosynthesis → Beginner
3. Three lesson cards appear — Kenyan biology teacher, sponsored by pharma company
4. Student clicks. Lesson plays. Sponsor badge visible.
5. Student types: "But what is chlorophyll exactly?"
6. Claude answers using lesson as context

**Judges see:** access, equity, AI, sustainable model — all in 90 seconds.

---

## Build vs Mock

| Mock | Build |
|---|---|
| Actual teacher videos | 3–4 placeholder video cards with real metadata |
| Sponsor payment system | Sponsor badge UI |
| Teacher onboarding flow | Student-facing search and match |
| Scale infrastructure | Core loop: search → match → lesson → follow-up |

---

## Build Order

1. Search input + Claude matching logic
2. Lesson card UI with mock content
3. Follow-up Q&A anchored to lesson
4. Sponsor badge on lesson view
5. Teacher profile page

---

## Pitch Narrative

**Act 1 — The villain:** A 14-year-old girl in rural Bihar fails her science exam. Not because she isn't smart. Because her teacher has 80 students, her parents never went to school, and Google gives her English results she can't read.

**Act 2 — The product:** Demo flow.

**Act 3 — The model:** Teachers get paid. Students get access. Companies get reach. Nobody loses.
