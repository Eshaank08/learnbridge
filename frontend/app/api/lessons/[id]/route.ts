import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const filePath = join(process.cwd(), "public", "lessons.json");
    const raw = readFileSync(filePath, "utf-8");
    const lessons = JSON.parse(raw) as { id: string }[];
    const lesson = lessons.find((l) => l.id === id);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json(lesson);
  } catch {
    return NextResponse.json({ error: "Failed to load lesson" }, { status: 500 });
  }
}
