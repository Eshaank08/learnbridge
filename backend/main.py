import json
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LearnBridge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
LESSONS_PATH = BASE_DIR / "seed-data" / "lessons.json"
with open(LESSONS_PATH, "r", encoding="utf-8") as f:
    LESSONS = json.load(f)

MOCK_MATCH_PATH = BASE_DIR / "mock_responses" / "match.json"
MOCK_FOLLOWUP_PATH = BASE_DIR / "mock_responses" / "followup.json"
with open(MOCK_MATCH_PATH, "r", encoding="utf-8") as f:
    MOCK_MATCH = json.load(f)
with open(MOCK_FOLLOWUP_PATH, "r", encoding="utf-8") as f:
    MOCK_FOLLOWUP = json.load(f)

from .prompts import MATCH_SYSTEM_PROMPT, FOLLOWUP_SYSTEM_PROMPT  # noqa: E402


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/match")
async def api_match(payload: dict):
    query = (payload.get("query") or "").strip()
    if not query:
        return {"error": "query required"}

    if os.getenv("MOCK_MODE") == "true":
        await __import__("asyncio").sleep(0.8)
        return MOCK_MATCH

    try:
        import anthropic
        client = anthropic.Anthropic()

        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            system=MATCH_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": query}],
        )
        classification = json.loads(msg.content[0].text)

        subject = classification.get("subject")
        concept = classification.get("concept")
        level = classification.get("level")

        filtered = [
            lesson for lesson in LESSONS
            if lesson.get("subject") == subject
            or any(concept.lower() in kw.lower() for kw in lesson.get("keywords", []))
        ]
        if not filtered:
            filtered = LESSONS[:3]

        ranked = sorted(filtered, key=lambda l: 0 if l.get("level") == level else 1)[:3]

        return {
            "detected_language": classification.get("detected_language", ""),
            "subject": subject,
            "concept": concept,
            "level": level,
            "lessons": ranked,
        }
    except Exception as exc:  # noqa: BLE001
        print("match error:", exc)
        return MOCK_MATCH


@app.post("/api/followup")
async def api_followup(payload: dict):
    question = (payload.get("question") or "").strip()
    lesson_id = (payload.get("lesson_id") or "").strip()
    lesson_summary = (payload.get("lesson_summary") or "").strip()

    if not question or not lesson_summary:
        return {"error": "missing fields"}

    if os.getenv("MOCK_MODE") == "true":
        await __import__("asyncio").sleep(0.6)
        return MOCK_FOLLOWUP

    try:
        import anthropic
        client = anthropic.Anthropic()

        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            system=FOLLOWUP_SYSTEM_PROMPT.format(lesson_summary=lesson_summary),
            messages=[{"role": "user", "content": question}],
        )
        return {"answer": msg.content[0].text}
    except Exception as exc:  # noqa: BLE001
        print("followup error:", exc)
        return MOCK_FOLLOWUP
