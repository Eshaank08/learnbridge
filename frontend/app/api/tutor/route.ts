import { NextRequest, NextResponse } from "next/server";

const MOCK_RESPONSES = [
  "That's a great question. Instead of telling you directly — what do you already know about this? Try to explain it in your own words first.",
  "Interesting. What do you think happens if that weren't true? What would break?",
  "You're on the right track. Can you connect this concept to something you've seen in everyday life?",
  "Before I answer that, what's your intuition? What does your gut say, even if you're not sure?",
  "Let me ask you this instead: if you had to explain this to a 10-year-old, how would you start?",
];

function buildSystemPrompt(
  courseTitle: string,
  lectureTitle: string,
  lectureSummary: string,
  whatYouLearn: string[]
): string {
  const outcomes = whatYouLearn.length > 0
    ? `\nLearning outcomes for this lecture:\n${whatYouLearn.map((o, i) => `${i + 1}. ${o}`).join("\n")}`
    : "";

  return `You are a Socratic AI tutor for the lecture "${lectureTitle}" in the course "${courseTitle}".

Your role is to guide students to understanding through questions — never give direct answers. Only explain something directly if the learner is clearly stuck after two consecutive wrong or confused attempts.${outcomes}

Lecture content (your reference only — do not quote it directly):
${lectureSummary?.slice(0, 1200) || "No summary available."}

## Rules
1. One question at a time — never stack multiple questions in a single message.
2. Keep messages short: 2–4 sentences max, except for a first greeting.
3. When a learner answers, give one sentence of feedback before your next question.
4. Ask probing questions that lead the student to discover the answer themselves.
5. Connect ideas to real life, prior knowledge, and adjacent concepts.
6. Never lecture — always engage in dialogue.
7. If asked something off-topic: "Let's stay focused on ${lectureTitle}. What part can I help you think through?"
8. Praise genuine effort and good reasoning, even when the answer is incomplete.
9. If the student seems to have understood the core idea, challenge them deeper: "Now — what would happen if…?"`;
}

export async function POST(req: NextRequest) {
  const { question, courseTitle, lectureTitle, lectureSummary, whatYouLearn, history } = await req.json();

  if (process.env.MOCK_MODE === "true") {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({
      response: MOCK_RESPONSES[Math.floor(Date.now() / 1000) % MOCK_RESPONSES.length],
    });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const messages_formatted = [
      ...(history || []),
      { role: "user" as const, content: question },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 280,
      system: buildSystemPrompt(courseTitle, lectureTitle, lectureSummary, whatYouLearn || []),
      messages: messages_formatted,
    });

    const text = (response.content[0] as { text: string }).text;
    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("Tutor error:", err);
    return NextResponse.json({
      response: "I'm having trouble thinking right now. Try again in a moment.",
    });
  }
}
