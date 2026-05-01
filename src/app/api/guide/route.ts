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

  const { essay, prompt, taskType, ieltsMode, knownErrors = [] } = await req.json() as {
    essay: string;
    prompt: string;
    taskType: string;
    ieltsMode: string;
    knownErrors?: string[];
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 15) return NextResponse.json({ suggestions: [] });

  const taskLabel = taskType === "task1"
    ? `Task 1 ${ieltsMode === "academic" ? "Academic (describe a visual/data)" : "General Training (letter writing)"}`
    : "Task 2 (argumentative/discursive essay)";

  const knownErrorsBlock = knownErrors.length > 0
    ? `\n⚠️ THIS STUDENT'S KNOWN REPEAT MISTAKES (check for these first):\n${knownErrors.map(e => `- ${e}`).join("\n")}`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 700,
    system: `You are an expert IELTS writing tutor watching a student write in real time. Give specific, encouraging feedback like a tutor sitting beside them. Always reference the student's ACTUAL words in your tips. Return only valid JSON.`,
    messages: [
      {
        role: "user",
        content: `IELTS ${taskLabel}
Task prompt: ${prompt || "(not yet provided)"}
${knownErrorsBlock}

Student's essay so far (${wordCount} words):
"""
${essay}
"""

Check for these issues in PRIORITY ORDER. Return the 3 most critical you find:

1. GRAMMAR — Subject-verb agreement, tense errors, article misuse (a/an/the), plural/singular errors
2. VOCABULARY — Informal words needing academic alternatives, weak/vague words, upgrade opportunities
3. REPEATED_WORDS — Same word/phrase used 3+ times (flag the specific word)
4. COHESION — Weak or missing connectors between sentences/paragraphs, abrupt transitions
5. SENTENCE_VARIETY — Too many sentences with same structure or length in a row
6. FORMALITY — Contractions (don't/can't), slang, colloquial phrases that lower register
7. TASK — Missing or weak address of specific parts of the prompt
8. CLARITY — Unclear, ambiguous or run-on sentences
9. STRUCTURE — Weak introduction (no clear position), missing conclusion, underdeveloped paragraphs

Return as JSON:
{
  "suggestions": [
    {
      "type": "grammar|vocabulary|repeated_words|cohesion|sentence_variety|formality|task|clarity|structure",
      "tip": "<specific 1-2 sentence advice>",
      "excerpt": "<the exact problematic phrase/sentence from their essay, or null>"
    }
  ]
}

Rules:
- excerpt must be a direct quote from the essay or null
- tip must reference their actual words where possible
- Be encouraging, not harsh
- Don't flag something that's already good`,
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
