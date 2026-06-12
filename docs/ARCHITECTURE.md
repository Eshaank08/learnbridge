# LearnBridge — Technical Architecture

## Stack (recommended)
- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Node.js / Python FastAPI
- **AI:** Claude API (claude-sonnet-4-6) — search matching + follow-up Q&A
- **Mock data:** JSON seed files for lessons, teachers, sponsors

## Core API Calls

### 1. Search + Match
```
POST /api/match
body: { query: "why do plants need sunlight", lang: "auto" }

→ Claude detects language, maps to subject/concept/level
→ Returns 3 lesson cards ranked by relevance
```

### 2. Follow-up Q&A
```
POST /api/followup
body: { question: "what is chlorophyll?", lesson_id: "bio-101", lesson_context: "..." }

→ Claude answers using lesson content as system context
→ Scoped response — stays on topic
```

## Data Models

### Lesson
```json
{
  "id": "bio-101",
  "title": "Photosynthesis Explained",
  "subject": "Biology",
  "concept": "Photosynthesis",
  "level": "beginner",
  "duration": "8 min",
  "teacher": { "name": "Dr. Amara Osei", "country": "Kenya" },
  "sponsor": { "name": "Bayer", "logo_url": "...", "tagline": "Investing in science futures" },
  "languages": ["en", "sw", "hi"],
  "content_summary": "...",
  "video_url": null
}
```

### Teacher
```json
{
  "id": "teacher-1",
  "name": "Dr. Amara Osei",
  "subject": "Biology",
  "country": "Kenya",
  "credentials": "PhD Botany, University of Nairobi",
  "lessons": ["bio-101", "bio-102"]
}
```

### Sponsor
```json
{
  "id": "sponsor-1",
  "name": "Bayer",
  "tagline": "Investing in science futures",
  "categories": ["Biology", "Chemistry"],
  "logo_url": "..."
}
```

## Claude Prompt Design

### Match prompt
```
System: You are an education matching engine. Given a student query, detect:
1. Language (ISO code)
2. Subject area
3. Specific concept
4. Difficulty level (beginner/intermediate/advanced)

Return JSON only.

User: [raw student input]
```

### Follow-up Q&A prompt
```
System: You are a tutor. The student just watched this lesson:
---
[lesson_content_summary]
---
Answer their follow-up question clearly, at their level. 
Stay anchored to the lesson content. Max 150 words.

User: [student question]
```
