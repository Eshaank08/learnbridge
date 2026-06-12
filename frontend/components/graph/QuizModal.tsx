"use client";

import { useState } from "react";
import type {
  Question,
  MCQQuestion,
  GradeItem,
  GradeTestResponse,
} from "@/lib/types";

// ─────────────────────────── Props ───────────────────────────

export interface QuizModalProps {
  open: boolean;
  questions: Question[];
  onClose: () => void;
  /** D7 will pass a function that calls gradeTest and updates state. */
  onSubmit: (items: GradeItem[]) => void;
  /** When set, the result view is shown. Null means question view. */
  result: GradeTestResponse | null;
  /** Optional — true while D7's gradeTest request is in-flight. */
  loading?: boolean;
  /** Called when the student clicks "Retake test" so the parent can clear result. */
  onRetake?: () => void;
  /** Non-empty string → show an error banner in the modal body. */
  error?: string | null;
  /** Called when the student clicks "Retry" inside the error banner. */
  onRetry?: () => void;
}

// ─────────────────────────── Helpers ───────────────────────────

/** Assemble GradeItem[] from the internal answer map. Returns null when any
 *  question has no answer yet (mcq not chosen, short text empty). */
function buildItems(
  questions: Question[],
  answers: Map<string, number | string>
): GradeItem[] | null {
  const items: GradeItem[] = [];
  for (const q of questions) {
    const answer = answers.get(q.id);
    if (answer === undefined || answer === "") return null;
    items.push({ question: q, answer });
  }
  return items;
}

// ─────────────────────────── Sub-components ───────────────────────────

function MCQQuestionView({
  question,
  selectedIndex,
  onChange,
  disabled,
}: {
  question: MCQQuestion;
  selectedIndex: number | undefined;
  onChange: (index: number) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="mb-6">
      <legend className="text-base font-medium text-gray-100 mb-3">
        {question.prompt}
      </legend>
      <div className="flex flex-col gap-2">
        {question.options.map((option, idx) => (
          <label
            key={idx}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
              selectedIndex === idx
                ? "border-amber-400 bg-amber-900/30 text-amber-100"
                : "border-gray-600 bg-gray-800 text-gray-200 hover:border-gray-400"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name={`mcq-${question.id}`}
              value={idx}
              checked={selectedIndex === idx}
              onChange={() => onChange(idx)}
              disabled={disabled}
              className="accent-amber-400"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
  // NOTE: `question.correctIndex` is intentionally never referenced anywhere in
  // this component's JSX or logic — it is present on the MCQQuestion type for
  // the backend/grader but the quiz UI must not render or surface it.
}

function ShortQuestionView({
  question,
  value,
  onChange,
  disabled,
}: {
  question: Question & { type: "short" };
  value: string;
  onChange: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-6">
      <p className="text-base font-medium text-gray-100 mb-3">
        {question.prompt}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        placeholder="Write your answer here…"
        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─────────────────────────── Main component ───────────────────────────

export default function QuizModal({
  open,
  questions,
  onClose,
  onSubmit,
  result,
  loading = false,
  onRetake,
  error,
  onRetry,
}: QuizModalProps) {
  // Map from question.id → chosen option index (mcq) or text (short).
  const [answers, setAnswers] = useState<Map<string, number | string>>(
    new Map()
  );

  if (!open) return null;

  // ── Helpers ──

  function setAnswer(id: string, value: number | string) {
    setAnswers((prev) => new Map(prev).set(id, value));
  }

  function handleSubmit() {
    if (loading) return;
    const items = buildItems(questions, answers);
    if (items === null) return; // some answers missing — button should be disabled anyway
    onSubmit(items);
  }

  /** Retake: clear local answers and notify the parent to clear result,
   *  which returns the modal to the question view. */
  function handleRetake() {
    setAnswers(new Map());
    onRetake?.();
  }

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => {
      const a = answers.get(q.id);
      if (q.type === "mcq") return typeof a === "number";
      return typeof a === "string" && a.trim().length > 0;
    });

  // ── Overlay / modal shell ──

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Quiz modal"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {result ? "Quiz Results" : "Mastery Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {result === null ? (
            // ════════════ QUESTION VIEW ════════════
            <>
              {/* Error banner — shown when a generate or grade request failed */}
              {error && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500 bg-red-900/30 px-4 py-3 mb-5">
                  <p className="text-sm text-red-200">{error}</p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
              {loading && questions.length === 0 ? (
                /* Generating skeleton — shown while the generate request is in-flight */
                <div className="flex flex-col gap-4 animate-pulse" aria-label="Loading questions…" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-4 rounded bg-gray-700 w-3/4" />
                      <div className="h-3 rounded bg-gray-700/60 w-1/2" />
                      <div className="mt-1 flex flex-col gap-1.5">
                        <div className="h-10 rounded-lg bg-gray-800 border border-gray-700" />
                        <div className="h-10 rounded-lg bg-gray-800 border border-gray-700" />
                        <div className="h-10 rounded-lg bg-gray-800 border border-gray-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : questions.length === 0 && !error ? (
                <p className="text-gray-400 text-sm">No questions available.</p>
              ) : questions.length > 0 ? (
                questions.map((q) => {
                  if (q.type === "mcq") {
                    return (
                      <MCQQuestionView
                        key={q.id}
                        question={q}
                        selectedIndex={answers.get(q.id) as number | undefined}
                        onChange={(idx) => setAnswer(q.id, idx)}
                        disabled={loading}
                      />
                    );
                  }
                  // q.type === "short"
                  return (
                    <ShortQuestionView
                      key={q.id}
                      question={q}
                      value={(answers.get(q.id) as string) ?? ""}
                      onChange={(text) => setAnswer(q.id, text)}
                      disabled={loading}
                    />
                  );
                })
              ) : null}
            </>
          ) : (
            // ════════════ RESULT VIEW ════════════
            <>
              {/* Overall score + pass/fail banner */}
              <div
                className={`rounded-xl px-5 py-4 mb-6 text-center ${
                  result.passed
                    ? "bg-emerald-900/40 border border-emerald-500 quiz-pass-celebrate"
                    : "bg-red-900/40 border border-red-500"
                }`}
              >
                <p className="text-4xl font-bold text-white mb-1">
                  {Math.round(result.score * 100)}%
                </p>
                <p
                  className={`text-lg font-semibold ${
                    result.passed ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {result.passed ? "✓ Passed!" : "✗ Not passed"}
                </p>
              </div>

              {/* Per-question breakdown */}
              <div className="flex flex-col gap-3 mb-6">
                {result.perQuestion.map((pq) => (
                  <div
                    key={pq.id}
                    className={`rounded-lg border px-4 py-3 ${
                      pq.correct
                        ? "border-emerald-600 bg-emerald-900/20"
                        : "border-red-600 bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={
                          pq.correct ? "text-emerald-400" : "text-red-400"
                        }
                        aria-label={pq.correct ? "Correct" : "Incorrect"}
                      >
                        {pq.correct ? "✓" : "✗"}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {pq.id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{pq.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Overall feedback */}
              <div className="rounded-lg bg-gray-800 border border-gray-600 px-4 py-3 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Overall Feedback
                </p>
                <p className="text-sm text-gray-200">{result.feedback}</p>
              </div>
            </>
          )}
        </div>

        {/* ── Footer / action buttons ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
          {result === null ? (
            // Question-view actions
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !allAnswered}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-gray-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Submitting…" : "Submit"}
              </button>
            </>
          ) : (
            // Result-view actions
            <>
              {!result.passed && (
                <button
                  onClick={handleRetake}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-gray-900 hover:bg-amber-400 transition-colors"
                >
                  Retake test
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
