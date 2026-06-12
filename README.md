# LearnBridge

Free, expert-taught education for any student, anywhere, in any language — funded by companies who want to reach them.

## How it works

A student types a question. Claude detects the language, subject, and concept. Three teacher-created lesson cards appear. The student watches a short lesson and asks a follow-up question. Claude answers only from the lesson content. No paywall. No signup.

## Actors

| Actor | What they get |
| --- | --- |
| Student | Free expert content matched to their exact question, in their language |
| Teacher | Paid to create content, global reach without building a business |
| Sponsor | Brand visibility inside lesson units, measurable student reach |

## Run it locally

```bash
# Frontend
cd frontend
npm install
npm run dev
# open http://localhost:3000

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set `MOCK_MODE=true` to run the frontend without calling Claude.

## Stack

Next.js 16 App Router, Tailwind CSS, FastAPI, Claude API (`claude-sonnet-4-6`).

## Demo flow

1. Open home page, type "मुझे photosynthesis समझाओ".
2. Press Find lessons.
3. View 3 lesson cards with teacher flags, subject, duration, sponsor.
4. Click a card.
5. Watch video placeholder.
6. See sponsor bar.
7. Ask follow-up: "What is chlorophyll?" → Claude answers from lesson.
8. Ask off-topic: "What is GDP of Germany?" → Claude redirects to lesson.

## What's mocked vs real

| Feature | Demo status |
| --- | --- |
| Search + match | Mocked |
| Lesson content | Real seed data |
| Follow-up Q&A | Mocked |
| Sponsor badge | Real UI |
| Teacher profiles | Real seed data |

## Team

Eshaan Kansal
