import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pro-only feature
  const [user] = await db
    .select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isActivePro =
    user?.plan === "pro" &&
    (user.planExpiresAt == null || user.planExpiresAt > new Date());

  if (!isActivePro) {
    return NextResponse.json({ error: "Guide mode is a Pro feature.", proRequired: true }, { status: 403 });
  }

  const { essay, prompt, taskType, ieltsMode } = await req.json() as {
    essay: string;
    prompt: string;
    taskType: string;
    ieltsMode: string;
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 15) {
    return NextResponse.json({ suggestions: [] });
  }

  const taskLabel =
    taskType === "task1"
      ? `Task 1 ${ieltsMode === "academic" ? "Academic (describe a visual)" : "General Training (write a letter)"}`
      : "Task 2 (argumentative essay)";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    system: `You are an expert IELTS writing tutor watching a student write in real time. Your role is to give short, specific, encouraging feedback — like a tutor sitting beside them. Focus only on the 2–3 most important issues visible RIGHT NOW. Do not repeat generic advice. Return only valid JSON.`,
    messages: [
      {
        role: "user",
        content: `IELTS ${taskLabel}
Task prompt: ${prompt || "(not provided yet)"}

Student's essay so far (${wordCount} words):
"""
${essay}
"""

Identify 2–3 of the most important real-time improvements. Return as JSON:
{
  "suggestions": [
    {
      "type": "grammar" | "vocabulary" | "structure" | "task",
      "tip": "<specific, actionable 1–2 sentence tip referencing their actual words where possible>"
    }
  ]
}

Types: "grammar" = errors/accuracy, "vocabulary" = word choice/range, "structure" = paragraph/flow/cohesion, "task" = relevance/completeness to the prompt.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") return NextResponse.json({ suggestions: [] });

  try {
    const json = JSON.parse(
      content.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()
    );
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
