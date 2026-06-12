# LearnBridge — Identified Problems

These are the gaps, risks, and failure modes in the current plan. Address before building.

---

## P1 — Critical (will kill demo if not fixed)

### 1. No lesson seed data
Claude's match logic needs real lessons to match against. Right now there are zero.
If there are no lessons to return, the demo loop breaks immediately.
**Fix:** Generate 20+ mock lessons across Biology, Physics, Math, History — before writing any frontend code.

### 2. Hindi demo is the hero moment — and untested
The pitch lives or dies on "student types in Hindi → system works". If the language detection or Claude's understanding fails live, the whole equity narrative collapses.
**Fix:** Test this specific flow first, before building anything else. Cache a fallback response.

### 3. Live API calls can fail under hackathon WiFi
Claude API + live demo = high risk. Judges won't care why it broke.
**Fix:** Implement a mock mode flag. If `MOCK_MODE=true`, return pre-seeded responses. Flip it if WiFi dies.

---

## P2 — High (weakens the pitch)

### 4. Business model has no numbers
"Companies want to reach students" is a thesis, not a model. Judges will ask: what does a sponsor pay?
**Fix:** Prepare one back-of-envelope slide: CPM model, e.g. €5 per 1,000 lesson views, 100K views/month = €500/month per sponsor. Rough is fine.

### 5. Screen 4 (Teacher Profile) + Screen 5 (Sponsor Page) are MVP bloat
You have 90 seconds. Screens 4 and 5 add complexity without proving the core thesis.
The core thesis is: search → match → learn → ask follow-up.
**Fix:** Cut Screens 4 and 5 to stubs. Teacher info lives on the lesson card. Sponsor page = static placeholder.

### 6. "Follow-up Q&A anchored to lesson" — scope is hard to enforce
Claude by default will answer anything. If a student asks something off-topic, it'll answer. That breaks the "anchored to lesson" promise.
**Fix:** System prompt must explicitly say "If the question is not answerable from the lesson content, say: I can only help with questions about this lesson. Ask a follow-up."

---

## P3 — Medium (polish/pitch quality)

### 7. No offline fallback for pitch narrative
If the live demo breaks, you need a recorded video or screenshot walkthrough ready.
**Fix:** Record a 90-second Loom of the demo flow before presenting. Have it open in a tab.

### 8. Sponsor badge feels decorative
In the current plan, the sponsor badge is a logo in the top right. That's easily missed.
**Fix:** Add a one-line sponsor tagline below the video: "This lesson is free because of [Sponsor]. Investing in science futures."

### 9. The competitive positioning is soft
Judges will ask: "How is this different from Khan Academy?"
**Fix:** Prepare a 3-point answer: (1) multilingual by default (2) AI follow-up (3) sustainable without charging students.

### 10. No success metric for the demo
What does "success" look like for a hackathon judge? Be explicit.
**Fix:** Before demo, state: "In 90 seconds, you'll see a student in rural Bihar get a free expert lesson in Hindi with AI follow-up — without paying, signing up, or knowing English."

---

## Scope Risk Summary

Current plan has 5 screens + AI matching + multilingual + Q&A + sponsor system.
That's ~3 days of clean work. You have 1 day.

**Ruthless cut list:**
- Screen 5 (Sponsor page) → static stub
- Screen 4 (Teacher profile) → info on lesson card only
- Teacher onboarding → not mentioned to judges
- Auth → explicitly call it a feature ("zero friction")
- Multiple languages live → demo Hindi only, mention others as capability
