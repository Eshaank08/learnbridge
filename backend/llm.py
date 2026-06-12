"""
Live Claude integration for LearnBridge — question generation via structured outputs.

Pydantic models mirror the §Contracts Question union (MCQQuestion + ShortQuestion)
and the GeneratedTest wrapper.  generate_test() is the sole public entry point.

Any SDK error or validation failure propagates to the caller, which maps it to
HTTP 502 — there is no silent fallback.
"""

import os
from typing import Annotated, Literal, Union

import anthropic
from pydantic import BaseModel, Field

from prompts import TEST_GENERATION_SYSTEM, SHORT_GRADING_SYSTEM

# ---------------------------------------------------------------------------
# Pydantic models — mirror §Contracts (frontend/lib/types.ts)
# ---------------------------------------------------------------------------


class MCQQuestion(BaseModel):
    id: str
    type: Literal["mcq"]
    prompt: str
    options: list[str] = Field(min_length=2)
    correctIndex: int = Field(ge=0)


class ShortQuestion(BaseModel):
    id: str
    type: Literal["short"]
    prompt: str


# Discriminated union on `type` — Pydantic resolves this at validation time.
AnyQuestion = Annotated[
    Union[MCQQuestion, ShortQuestion],
    Field(discriminator="type"),
]


class GeneratedTest(BaseModel):
    """Top-level structured-output wrapper returned by Claude."""

    questions: list[AnyQuestion]


# ---------------------------------------------------------------------------
# Grading models — used by grade_short_answers()
# ---------------------------------------------------------------------------


class ShortGradeResult(BaseModel):
    id: str
    correct: bool
    feedback: str


class ShortGradingResponse(BaseModel):
    results: list[ShortGradeResult]


# ---------------------------------------------------------------------------
# Client (initialised lazily from env — dotenv already loaded by main.py)
# ---------------------------------------------------------------------------


def _client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set — cannot make live Claude calls."
        )
    return anthropic.Anthropic(api_key=api_key)


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------


def generate_test(node: dict, language: str = "en") -> list[dict]:
    """Call Claude to generate a test for *node* and return questions as plain dicts.

    The returned list matches the §Contracts Question union shapes:
      MCQ:   {"id", "type": "mcq", "prompt", "options", "correctIndex"}
      Short: {"id", "type": "short", "prompt"}

    Any exception (network error, auth failure, validation failure) propagates
    to the caller; the generate route maps it to HTTP 502.
    """
    title: str = node["title"]
    summary: str = node.get("summary", "")
    num_questions: int = node["test"]["numQuestions"]
    pass_threshold: float = node["test"]["passThreshold"]

    user_message = (
        f"Node title: {title}\n\n"
        f"Node summary:\n{summary}\n\n"
        f"numQuestions: {num_questions}\n"
        f"passThreshold: {pass_threshold}\n"
        f"language: {language}\n\n"
        "Generate the quiz now."
    )

    resp = _client().messages.parse(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=TEST_GENERATION_SYSTEM,
        messages=[{"role": "user", "content": user_message}],
        output_format=GeneratedTest,
        timeout=30,
    )

    parsed: GeneratedTest | None = resp.parsed_output
    if parsed is None:
        raise ValueError(
            "Claude returned a response but structured output could not be parsed."
        )

    # Convert each question to a plain dict matching §Contracts.
    result: list[dict] = []
    for q in parsed.questions:
        if isinstance(q, MCQQuestion):
            result.append(
                {
                    "id": q.id,
                    "type": "mcq",
                    "prompt": q.prompt,
                    "options": q.options,
                    "correctIndex": q.correctIndex,
                }
            )
        else:
            # ShortQuestion
            result.append(
                {
                    "id": q.id,
                    "type": "short",
                    "prompt": q.prompt,
                }
            )

    return result


def grade_short_answers(node: dict, short_items: list[dict]) -> list[dict]:
    """Grade short-answer items using Claude structured outputs.

    short_items is a list of dicts with shape:
        { "question": { "id": str, "type": "short", "prompt": str },
          "answer": str }

    Returns a list of plain dicts:
        { "id": str, "correct": bool, "feedback": str }

    If short_items is empty, returns [] without calling Claude.

    Any SDK error or validation failure propagates to the caller, which maps
    it to HTTP 502.
    """
    if not short_items:
        return []

    summary: str = node.get("summary", "")
    title: str = node["title"]

    # Build the user message: node summary + question/answer pairs.
    lines: list[str] = [
        f"Node title: {title}",
        "",
        f"Node summary:\n{summary}",
        "",
        "Short-answer submissions to grade:",
    ]
    for item in short_items:
        q = item["question"]
        a = item["answer"]
        lines.append(f'\nQuestion id: {q["id"]}')
        lines.append(f'Question: {q["prompt"]}')
        lines.append(f"Student answer: {a}")

    user_message = "\n".join(lines)

    resp = _client().messages.parse(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SHORT_GRADING_SYSTEM,
        messages=[{"role": "user", "content": user_message}],
        output_format=ShortGradingResponse,
        timeout=30,
    )

    parsed: ShortGradingResponse | None = resp.parsed_output
    if parsed is None:
        raise ValueError(
            "Claude returned a response but short-grading output could not be parsed."
        )

    return [
        {"id": r.id, "correct": r.correct, "feedback": r.feedback}
        for r in parsed.results
    ]
