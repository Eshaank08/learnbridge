import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

type Course = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  subject: string;
  level: string;
  total_hours: number;
  duration: string;
  teacher: { name: string; institution: string; flag: string; bio: string };
  sponsor: { name: string; tagline: string };
};

function loadCourses(): Course[] {
  const file = join(process.cwd(), "public", "courses.json");
  return JSON.parse(readFileSync(file, "utf-8"));
}

// Map a course into the lesson-card shape the results page renders.
function toCard(c: Course, concept: string) {
  return {
    id: c.id,
    title: c.title,
    subject: c.subject,
    concept: concept || c.subject,
    level: c.level,
    duration: `${c.total_hours} hours`,
    teacher: {
      name: c.teacher.name,
      country: c.teacher.institution,
      flag: c.teacher.flag,
      credentials: c.teacher.bio,
    },
    sponsor: c.sponsor,
  };
}

// Keyword fallback when classification doesn't map cleanly to a subject.
function keywordMatch(courses: Course[], query: string): Course[] {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 3);
  const scored = courses
    .map((c) => {
      const hay = `${c.title} ${c.subtitle} ${c.subject} ${c.description}`.toLowerCase();
      const score = words.reduce((s, w) => (hay.includes(w) ? s + 1 : s), 0);
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.c);
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const courses = loadCourses();
  const subjects = [...new Set(courses.map((c) => c.subject))];

  // Mock mode — classify with simple keyword fallback, no Claude call.
  if (process.env.MOCK_MODE === "true") {
    await new Promise((r) => setTimeout(r, 600));
    const matched = keywordMatch(courses, query);
    const list = (matched.length ? matched : courses).slice(0, 3);
    return NextResponse.json({
      detected_language: "English (en)",
      subject: list[0]?.subject || "General",
      concept: query,
      level: "beginner",
      lessons: list.map((c) => toCard(c, query)),
    });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const classification = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: `You are an education classification engine. A student asks a question in ANY language. Return ONLY valid JSON (no markdown):
{
  "detected_language": "Hindi (hi)",
  "subject": "<closest match from the allowed list>",
  "concept": "<the specific topic, in English>",
  "level": "beginner"
}
subject MUST be exactly one of these: ${subjects.join(", ")}.
Pick the single closest subject. level must be: beginner, intermediate, or advanced.`,
      messages: [{ role: "user", content: query }],
    });

    const raw = (classification.content[0] as { text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));

    // Filter real courses by the detected subject.
    let matched = courses.filter(
      (c) => c.subject.toLowerCase() === String(parsed.subject || "").toLowerCase()
    );

    // Fallback to keyword search if the subject didn't line up with any course.
    if (matched.length === 0) matched = keywordMatch(courses, query);
    if (matched.length === 0) matched = courses.slice(0, 3);

    return NextResponse.json({
      detected_language: parsed.detected_language,
      subject: parsed.subject,
      concept: parsed.concept,
      level: parsed.level,
      lessons: matched.slice(0, 4).map((c) => toCard(c, parsed.concept)),
    });
  } catch (err) {
    console.error("Match error:", err);
    const matched = keywordMatch(courses, query);
    const list = (matched.length ? matched : courses).slice(0, 3);
    return NextResponse.json({
      detected_language: "English (en)",
      subject: list[0]?.subject || "General",
      concept: query,
      level: "beginner",
      lessons: list.map((c) => toCard(c, query)),
    });
  }
}
