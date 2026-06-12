import { NextRequest, NextResponse } from "next/server";

const MOCK_RESPONSE = {
  detected_language: "Hindi (hi)",
  subject: "Biology",
  concept: "Photosynthesis",
  level: "beginner",
  lessons: [
    {
      id: "bio-001",
      title: "Photosynthesis Explained",
      subject: "Biology",
      concept: "Photosynthesis",
      level: "beginner",
      duration: "8 min",
      teacher: { name: "Dr. Amara Osei", country: "Kenya", flag: "🇰🇪", credentials: "PhD Botany, University of Nairobi" },
      sponsor: { name: "Bayer", tagline: "Investing in the scientists of tomorrow." },
    },
    {
      id: "bio-002",
      title: "How Plants Make Energy",
      subject: "Biology",
      concept: "Photosynthesis",
      level: "beginner",
      duration: "6 min",
      teacher: { name: "Priya Sharma", country: "India", flag: "🇮🇳", credentials: "MSc Biology, IIT Bombay" },
      sponsor: { name: "Sun Pharma", tagline: "Growing the next generation of scientists." },
    },
    {
      id: "bio-003",
      title: "Chlorophyll and Light Energy",
      subject: "Biology",
      concept: "Photosynthesis",
      level: "intermediate",
      duration: "11 min",
      teacher: { name: "Carlos Mendez", country: "Brazil", flag: "🇧🇷", credentials: "PhD Plant Biology, USP" },
      sponsor: { name: "Embrapa", tagline: "Science for the future of food." },
    },
  ],
};

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  // Mock mode — return seeded data without calling Claude
  if (process.env.MOCK_MODE === "true") {
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return NextResponse.json(MOCK_RESPONSE);
  }

  // Live Claude match — replace with backend /api/match when ready
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const classification = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: `You are an education classification engine. Given a student query (any language), return ONLY valid JSON:
{
  "detected_language": "English (en)",
  "subject": "Biology",
  "concept": "Photosynthesis",
  "level": "beginner"
}
subject must be one of: Biology, Physics, Mathematics, History
level must be: beginner, intermediate, or advanced`,
      messages: [{ role: "user", content: query }],
    });

    const parsed = JSON.parse(
      (classification.content[0] as { text: string }).text
    );

    // TODO: filter lessons.json by subject/concept/level when seed data is ready
    // For now return mock lessons
    return NextResponse.json({ ...parsed, lessons: MOCK_RESPONSE.lessons });
  } catch (err) {
    console.error("Match error:", err);
    return NextResponse.json(MOCK_RESPONSE); // fallback to mock on error
  }
}
