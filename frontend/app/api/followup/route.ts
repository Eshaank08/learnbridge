import { NextRequest, NextResponse } from "next/server";

const MOCK_ANSWER =
  "Chlorophyll is the green pigment found inside chloroplasts in plant cells. It absorbs light energy — mainly red and blue wavelengths — and uses that energy to drive the photosynthesis reaction. It's what makes plants green, and it's the key to converting sunlight into chemical energy the plant can use.";

export async function POST(req: NextRequest) {
  const { question, lesson_id, lesson_summary } = await req.json();

  if (!question || !lesson_summary) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (process.env.MOCK_MODE === "true") {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ answer: MOCK_ANSWER });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: `You are a tutor. The student just watched a lesson. Here is the lesson content:

---
${lesson_summary}
---

Answer the student's question clearly and simply. Keep it under 120 words.
If the question cannot be answered from the lesson content, say exactly: "I can only help with questions about this lesson. Try asking something from what we just covered."
Do not answer off-topic questions.`,
      messages: [{ role: "user", content: question }],
    });

    const answer = (response.content[0] as { text: string }).text;
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Followup error:", err);
    return NextResponse.json({ answer: MOCK_ANSWER }); // fallback
  }
}
