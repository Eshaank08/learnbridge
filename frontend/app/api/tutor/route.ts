import { NextRequest, NextResponse } from "next/server";

const MOCK_RESPONSES = [
  "That's a great question. Instead of telling you directly — what do you already know about this? Try to explain it in your own words first.",
  "Interesting. What do you think happens if that weren't true? What would break?",
  "You're on the right track. Can you connect this concept to something you've seen in everyday life?",
  "Before I answer that, what's your intuition? What does your gut say, even if you're not sure?",
  "Let me ask you this instead: if you had to explain this to a 10-year-old, how would you start?",
];

export async function POST(req: NextRequest) {
  const { question, courseTitle, lectureTitle, lectureSummary, history } = await req.json();

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
      max_tokens: 250,
      system: `You are a Socratic learning guide for a student studying "${lectureTitle}" in the course "${courseTitle}".

Your role is to help students think, not to give them answers. You:
- Ask probing questions that lead students to discover answers themselves
- Point out connections between ideas
- Give hints, not solutions
- Praise good thinking, redirect incorrect assumptions gently
- Keep responses short (2-4 sentences max)
- Never lecture — always engage in dialogue

Lecture context (for your reference only, do not quote directly):
${lectureSummary?.slice(0, 800) || "No summary available."}

If a student asks something completely off-topic, say: "Let's stay focused on what we're learning today. What part of ${lectureTitle} can I help you think through?"`,
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
