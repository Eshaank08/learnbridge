import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from seed import get_node  # noqa: E402 — load_dotenv must run first
from mocks import mock_questions, grade_items  # noqa: E402
from llm import generate_test, grade_short_answers  # noqa: E402

app = FastAPI(title="LearnBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class GenerateRequest(BaseModel):
    graph_id: str
    node_id: str
    language: str = "en"


class GenerateResponse(BaseModel):
    questions: list[dict]


class GradeItem(BaseModel):
    question: dict
    answer: int | str  # mcq: option index (int); short: free text (str)


class GradeRequest(BaseModel):
    graph_id: str
    node_id: str
    items: list[GradeItem]


class PerQuestionResult(BaseModel):
    id: str
    correct: bool
    feedback: str


class GradeResponse(BaseModel):
    score: float
    passed: bool
    perQuestion: list[PerQuestionResult]
    feedback: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/test/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    node = get_node(req.graph_id, req.node_id)
    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{req.node_id}' not found in graph '{req.graph_id}'.",
        )

    mock_mode = os.getenv("MOCK_MODE", "true").lower() not in ("false", "0", "no")

    if mock_mode:
        return GenerateResponse(questions=mock_questions(node))

    # Live mode (D3) — call Claude via structured outputs.
    try:
        questions = generate_test(node, req.language)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Live question generation failed: {exc}",
        ) from exc
    return GenerateResponse(questions=questions)


@app.post("/api/test/grade", response_model=GradeResponse)
def grade(req: GradeRequest) -> GradeResponse:
    node = get_node(req.graph_id, req.node_id)
    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{req.node_id}' not found in graph '{req.graph_id}'.",
        )

    mock_mode = os.getenv("MOCK_MODE", "true").lower() not in ("false", "0", "no")

    if mock_mode:
        items = [item.model_dump() for item in req.items]
        result = grade_items(node, items)
        return GradeResponse(**result)

    # Live mode (D4): MCQ scored deterministically in Python; short answers via Claude.
    items = [item.model_dump() for item in req.items]

    # Split items by question type.
    mcq_items = [it for it in items if it["question"].get("type") == "mcq"]
    short_items = [it for it in items if it["question"].get("type") == "short"]

    # Grade MCQs deterministically (reuse mocks.grade_items with only mcq items).
    mcq_per_question: list[dict] = []
    mcq_correct = 0
    for it in mcq_items:
        question = it["question"]
        answer = it["answer"]
        correct = answer == question.get("correctIndex")
        mcq_correct += int(correct)
        mcq_per_question.append({
            "id": question["id"],
            "correct": correct,
            "feedback": "Correct." if correct else "Not quite — review the topic summary.",
        })

    # Grade short answers via Claude (zero items → [] without calling Claude).
    try:
        short_per_question = grade_short_answers(node, short_items)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Live short-answer grading failed: {exc}",
        ) from exc

    # Merge results preserving original question order.
    short_by_id = {r["id"]: r for r in short_per_question}
    per_question: list[dict] = []
    correct_count = 0
    for it in items:
        q_id = it["question"]["id"]
        q_type = it["question"].get("type")
        if q_type == "mcq":
            result_entry = next(r for r in mcq_per_question if r["id"] == q_id)
        else:
            result_entry = short_by_id[q_id]
        per_question.append(result_entry)
        correct_count += int(result_entry["correct"])

    total = len(items)
    score = correct_count / total if total > 0 else 0.0
    pass_threshold: float = node["test"]["passThreshold"]
    passed = score >= pass_threshold

    if passed:
        overall_feedback = (
            f"Well done! You scored {correct_count}/{total} "
            f"({score * 100:.0f}%) and passed the {pass_threshold * 100:.0f}% threshold."
        )
    else:
        overall_feedback = (
            f"You scored {correct_count}/{total} ({score * 100:.0f}%), "
            f"which is below the {pass_threshold * 100:.0f}% threshold. "
            "Review the topic summary and try again."
        )

    return GradeResponse(
        score=score,
        passed=passed,
        perQuestion=[PerQuestionResult(**pq) for pq in per_question],
        feedback=overall_feedback,
    )
