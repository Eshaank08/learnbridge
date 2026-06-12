import type {
  GenerateTestRequest,
  GenerateTestResponse,
  GradeTestRequest,
  GradeTestResponse,
  ApiError,
  Question,
} from "./types";

// ─── Base URL ────────────────────────────────────────────────────────────────

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Error helper ────────────────────────────────────────────────────────────

async function toApiError(res: Response): Promise<ApiError> {
  let detail = `Request failed with status ${res.status}`;
  try {
    const body = await res.json();
    if (typeof body?.detail === "string" && body.detail.length > 0) {
      detail = body.detail;
    }
  } catch {
    // body is not JSON — fall back to generic message above
  }
  return { status: res.status, detail };
}

// ─── Client-mock fixtures ────────────────────────────────────────────────────

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "mcq",
    prompt: "Which of the following best describes this topic?",
    options: [
      "A foundational concept that underpins further study",
      "An advanced specialisation with no prerequisites",
      "A purely theoretical construct with no practical use",
      "A deprecated idea no longer used in the field",
    ],
    correctIndex: 0,
  },
  {
    id: "q2",
    type: "mcq",
    prompt: "What is the primary purpose of studying this subject?",
    options: [
      "To memorise definitions without understanding",
      "To build problem-solving skills and conceptual understanding",
      "To pass exams without retaining knowledge",
      "To avoid studying related topics",
    ],
    correctIndex: 1,
  },
  {
    id: "q3",
    type: "mcq",
    prompt: "Which learning approach is most effective for mastering this concept?",
    options: [
      "Passive reading only",
      "Practice problems and active recall",
      "Copying notes verbatim",
      "Skipping foundational material",
    ],
    correctIndex: 1,
  },
  {
    id: "q4",
    type: "short",
    prompt:
      "In your own words, briefly explain the core idea of this topic and why it matters.",
  },
];

function mockGrade(req: GradeTestRequest): GradeTestResponse {
  let correct = 0;
  const perQuestion = req.items.map((item) => {
    if (item.question.type === "mcq") {
      const isCorrect = item.answer === item.question.correctIndex;
      if (isCorrect) correct++;
      return {
        id: item.question.id,
        correct: isCorrect,
        feedback: isCorrect
          ? "Correct! Well done."
          : `Incorrect. The right answer was option ${item.question.correctIndex + 1}.`,
      };
    } else {
      // short: non-empty answer → correct (mock rule)
      const isCorrect =
        typeof item.answer === "string" && item.answer.trim().length > 0;
      if (isCorrect) correct++;
      return {
        id: item.question.id,
        correct: isCorrect,
        feedback: isCorrect
          ? "Good effort — your answer captures the key idea."
          : "No answer provided. Try to explain the concept in your own words.",
      };
    }
  });

  const total = req.items.length;
  const score = total > 0 ? correct / total : 0;
  // Use a fixed threshold of 0.7 for client-mock (matches the demo fixture default).
  const passed = score >= 0.7;

  return {
    score,
    passed,
    perQuestion,
    feedback: passed
      ? "Great work! You demonstrated a solid understanding of this topic."
      : "Keep practising — review the material and try again. Focus on the questions you missed.",
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generateTest(
  req: GenerateTestRequest
): Promise<GenerateTestResponse> {
  if (process.env.NEXT_PUBLIC_CLIENT_MOCK === "true") {
    return { questions: MOCK_QUESTIONS };
  }

  const res = await fetch(`${baseUrl}/api/test/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json() as Promise<GenerateTestResponse>;
}

export async function gradeTest(
  req: GradeTestRequest
): Promise<GradeTestResponse> {
  if (process.env.NEXT_PUBLIC_CLIENT_MOCK === "true") {
    return mockGrade(req);
  }

  const res = await fetch(`${baseUrl}/api/test/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json() as Promise<GradeTestResponse>;
}
