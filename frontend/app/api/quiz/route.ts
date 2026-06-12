import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MOCK_QUESTIONS = [
  { q: "What is the key idea you took away from this lecture, and why does it matter?", hint: "Think about the opening motivation the teacher gave..." },
  { q: "How would you explain the main concept to someone who has never heard of it?", hint: "Try to use an analogy from everyday life..." },
  { q: "What is one real-world situation where this knowledge could make a difference?", hint: "Consider the examples given in the materials..." },
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, lectureTitle, lectureSummary, question, answer } = body;

  if (process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY) {
    if (action === "generate") {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ questions: MOCK_QUESTIONS });
    }
    return NextResponse.json({ feedback: "Good thinking! You've captured the core idea well. Consider also how this connects to the broader topic.", correct: true });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  if (action === "generate") {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `Generate exactly 3 open-ended quiz questions for a student who just finished this lecture.

Lecture title: "${lectureTitle}"
Content summary: ${lectureSummary}

Return ONLY a valid JSON array with no markdown, no explanation:
[{"q":"question text","hint":"a guiding hint without giving the answer"},{"q":"...","hint":"..."},{"q":"...","hint":"..."}]

Rules:
- Test deep understanding, not memorization
- Open-ended (not multiple choice)
- Short questions (one sentence)
- Hints should guide thinking, not give the answer away`,
      }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const questions = match ? JSON.parse(match[0]) : MOCK_QUESTIONS;
    return NextResponse.json({ questions });
  }

  if (action === "check") {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Quiz question: "${question}"
Student's answer: "${answer}"
Lecture context: ${lectureSummary}

Give brief feedback in 1-2 sentences. Be encouraging. Point out what's right, and gently note what could be stronger.
Return ONLY valid JSON: {"feedback":"...","correct":true}
Set correct=false only if the answer is clearly wrong or completely off-topic.`,
      }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : '{"feedback":"Good thinking!","correct":true}';
    const match = raw.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : { feedback: "Good thinking!", correct: true };
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
