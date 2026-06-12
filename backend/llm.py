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

from prompts import TEST_GENERATION_SYSTEM

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
