# Hermes Task Prompts — LearnBridge Platform Branch

All Hermes tasks are small, isolated, and produce files you drop directly into the repo.
Hermes never touches code. It generates JSON, Markdown, or SVG only.
You review before committing anything.

---

## Task 1 — Generate seed lessons (run first)

Paste this into Hermes:

```
Generate a JSON file called lessons.json for an education platform called LearnBridge.

Rules:
- 20 lessons total
- 4 subjects: Biology, Physics, Mathematics, History
- 5 lessons per subject, mix of beginner/intermediate
- Teachers: diverse names and countries (Kenya, India, Brazil, Germany, Nigeria, Mexico, Bangladesh)
- Sponsors: real-sounding companies matched to subject (pharma→Biology, tech→Math, energy→Physics, NGO→History)
- Each lesson needs a content_summary: 3 solid paragraphs of actual lesson content — this is what Claude uses to answer follow-up questions. Make it educational and accurate.

JSON structure per lesson (output only valid JSON, no commentary):
{
  "id": "bio-001",
  "title": "...",
  "subject": "Biology",
  "concept": "Photosynthesis",
  "keywords": ["plants", "sunlight", "chlorophyll"],
  "level": "beginner",
  "duration": "8 min",
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
  },
  "content_summary": "..."
}

Output: a single JSON array. No explanation. Save result to learnbridge/seed-data/lessons.json
```

---

## Task 2 — Competitive research (run in parallel with Task 1)

```
Research task. Output Markdown only. No code.

Topic: What's missing from existing free education platforms that LearnBridge solves?

Cover:
1. Khan Academy — what it does, what it lacks (multilingual AI follow-up, sponsor model)
2. Byju's — what it does, what it lacks (paywalled, India-centric)
3. Coursera — what it does, what it lacks (certificate focus, not for school students)
4. YouTube education — what it does, what it lacks (no structure, no follow-up, no language detection)

Then write:
- 3 crisp differentiator bullets for LearnBridge (max 15 words each)
- 1 statistic on how many students lack quality education access (cite source)
- 2-sentence answer to: "How is this different from Khan Academy?" — for a hackathon judge

Output: research.md — bullet points only. Max 1.5 pages.
Save to learnbridge/docs/research.md
```

---

## Task 3 — Framer Motion animation spec (run after seeing home page)

```
You are a UI/UX consultant. No code output — describe animations only.

Product: LearnBridge — a dark-themed education search platform (Next.js, Framer Motion).

Describe the exact Framer Motion animations needed for:

1. Home page — search input appears: how should it animate in?
2. Example query chips — how do they appear? Staggered? Fade? From where?
3. Results page — lesson cards: do they stagger in? Slide up? Fade?
4. Lesson card hover — what micro-interaction?
5. Q&A chat messages — how does each message enter?
6. Thinking dots — bouncing, pulsing, or waving?

For each animation: describe the initial state, the animate state, and the transition config as if writing Framer Motion props. 
Keep it implementable — e.g. "initial: {opacity: 0, y: 20}, animate: {opacity: 1, y: 0}, transition: {duration: 0.3, delay: index * 0.1}"

Output: animation-spec.md
Save to learnbridge/docs/animation-spec.md
```

---

## Task 4 — Sponsor taglines + badge copy (run when building lesson view)

```
Copywriting task. No code.

Product: LearnBridge — free education funded by sponsor companies.

Write sponsor bar copy for 5 different sponsors. The sponsor bar appears on every lesson view:
"This lesson is free thanks to [Sponsor]. [Tagline]."

The tagline should feel warm, mission-aligned, not corporate. Like a company that genuinely cares about education — not an ad.

Sponsors:
1. Bayer (Biology lessons)
2. Deutsche Bank (History/Economics lessons)
3. Siemens (Physics lessons)
4. SAP (Mathematics/Computer Science lessons)
5. UNICEF (all subjects)

For each: write the full sponsor bar sentence.
Also write a 1-line "about this sponsor" blurb (max 20 words) for the sponsor page.

Output: sponsor-copy.md
Save to learnbridge/docs/sponsor-copy.md
```

---

## Task 5 — Pitch prep (run T+4h, day of hackathon)

```
Pitch preparation. No code.

Product: LearnBridge
Audience: Hackathon judges, 3-minute Q&A after a 90-second demo

Write answers to these 5 questions. Each answer: max 3 sentences. Direct, confident, no filler.

1. "How is this different from Khan Academy?"
2. "Why would a company sponsor this instead of running Google ads?"
3. "What stops a big tech company from copying this in a week?"
4. "How do you ensure the lesson content is accurate?"
5. "What's the monetization model long-term — are you just a charity?"

Then: write a back-of-envelope business model note (5 bullet points):
- Assume 100K monthly lesson views at launch
- CPM rate for education audience
- Monthly revenue from 5 sponsors
- Teacher payout model (% of sponsor revenue per lesson)
- Path to 1M monthly views

Output: pitch-prep.md
Save to learnbridge/docs/pitch-prep.md
```

---

## Task 6 — README for hackathon submission (run last, after everything is built)

```
Write the final README.md for LearnBridge — a hackathon submission.

Include:
- One-line pitch
- The three actors (Student, Teacher, Sponsor) — table format
- Screenshot descriptions (describe what each page looks like — I'll add actual screenshots)
- How to run: npm run dev in /frontend
- Demo flow (the 90-second walkthrough numbered)
- Stack: Next.js 14 App Router, Tailwind CSS, Framer Motion, Claude API (claude-sonnet-4-6)
- What's mocked vs live on demo day
- Team: Eshaan Kansal

Tone: confident, not hyped. Written for a judge who reads 50 projects in one day and has 90 seconds.
Max 1 page.

Output: replace learnbridge/README.md
```

---

## Hermes workflow rules

1. Always tell Hermes to save to the exact path listed above
2. Review the output before committing — Hermes output is good but needs a read
3. JSON from Hermes: validate it with `python3 -m json.tool lessons.json` before using
4. Never paste Hermes output directly into code files — only into data/docs folders
5. If Hermes output is wrong, give it one correction and regenerate — don't iterate more than twice
