import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from seed import get_node  # noqa: E402 — load_dotenv must run first
from mocks import mock_questions, grade_items  # noqa: E402

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

    # Live mode (D3) — not yet implemented.
    raise HTTPException(status_code=502, detail="Live mode not yet implemented.")


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

    # Live mode (D4) — not yet implemented.
    raise HTTPException(status_code=502, detail="Live grading not yet implemented.")
