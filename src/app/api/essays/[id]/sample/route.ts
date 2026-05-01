import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [essay] = await db
    .select({
      prompt: essays.prompt,
      taskType: essays.taskType,
      sampleEssay: essays.sampleEssay,
    })
    .from(essays)
    .where(and(eq(essays.id, id), eq(essays.userId, session.user.id)))
    .limit(1);

  if (!essay) {
    return NextResponse.json({ error: "Essay not found" }, { status: 404 });
  }

  // ── Return cached version if it exists ──────────────────────────────────
  if (essay.sampleEssay) {
    return NextResponse.json({ sample: essay.sampleEssay, cached: true });
  }

  // ── Generate a new model answer ──────────────────────────────────────────
  const taskLabel =
    essay.taskType === "task1"
      ? "IELTS Academic Task 1 (describing data/visuals)"
      : "IELTS Task 2 (argumentative essay)";

  const wordTarget =
    essay.taskType === "task1" ? "around 175–190 words" : "around 280–300 words";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1200,
    system: `You are an expert IELTS examiner and writing tutor. Write model Band 8–9 essays that are clear, natural, and realistic — not artificially complex. Essays should demonstrate sophisticated vocabulary, varied sentence structures, strong coherence, and full task achievement.`,
    messages: [
      {
        role: "user",
        content: `Write a model Band 8–9 ${taskLabel} response for this task prompt:

---
${essay.prompt}
---

Requirements:
- Write ${wordTarget}
- Use natural, sophisticated language appropriate for Band 8–9
- Structure: clear introduction, well-developed body paragraphs, concise conclusion
- Show a range of grammatical structures and precise vocabulary
- Fully address all parts of the task

Return ONLY the essay text. No preamble, no labels, no band score commentary.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  const sample = content.text.trim();

  // ── Cache in DB so future requests are free ──────────────────────────────
  await db
    .update(essays)
    .set({ sampleEssay: sample })
    .where(eq(essays.id, id));

  return NextResponse.json({ sample, cached: false });
}
