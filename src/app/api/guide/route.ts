import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { checkIsPro } from "@/lib/is-pro";

const anthropic = new Anthropic();

const PRO_DAILY_GUIDE_CALLS = 50;

function currentDayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Truncate essay to at most maxWords words (preserves sentence boundaries best-effort). */
function truncateEssay(text: string, maxWords = 600): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + " …[truncated]";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({ plan: users.plan, planExpiresAt: users.planExpiresAt, guideCallCount: users.guideCallCount, guideCallDayKey: users.guideCallDayKey })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isActivePro = checkIsPro(user, session.user.email);

  if (!isActivePro) {
    return NextResponse.json({ error: "Guide mode is a Pro feature.", proRequired: true }, { status: 403 });
  }

  // ── Daily rate limit ───────────────────────────────────────────────────────
  const dayKey = currentDayKey();
  const sameDay = user?.guideCallDayKey === dayKey;
  const usedToday = sameDay ? (user?.guideCallCount ?? 0) : 0;

  if (usedToday >= PRO_DAILY_GUIDE_CALLS) {
    return NextResponse.json(
      { error: `Guide mode allows ${PRO_DAILY_GUIDE_CALLS} AI analyses per day. Limit resets at midnight.`, limitReached: true },
      { status: 429 }
    );
  }

  // Increment counter
  await db
    .update(users)
    .set({ guideCallCount: usedToday + 1, guideCallDayKey: dayKey })
    .where(eq(users.id, session.user.id));

  const { essay, prompt, taskType, ieltsMode, knownErrors = [], mode = "analyze" } = await req.json() as {
    essay: string;
    prompt: string;
    taskType: string;
    ieltsMode: string;
    knownErrors?: string[];
    mode?: "analyze" | "continue";
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 15) return NextResponse.json({ suggestions: [] });

  // ── Truncate essay to cap input tokens ────────────────────────────────────
  const essayForAI = truncateEssay(essay, 600);

  const taskLabel = taskType === "task1"
    ? `Task 1 ${ieltsMode === "academic" ? "Academic (describe a visual/data)" : "General Training (letter writing)"}`
    : "Task 2 (argumentative/discursive essay)";

  // ── CONTINUATION MODE — phrase suggestions when student pauses ────────────
  if (mode === "continue") {
    const task1Phrases = ieltsMode === "academic"
      ? "Useful Task 1 Academic phrases: 'As the chart clearly demonstrates,', 'A closer examination reveals that', 'In contrast, the figures for X show', 'Overall, it is evident that', 'The most striking feature is', 'There was a significant increase/decrease in', 'This was followed by a gradual rise in', 'The proportion of X remained relatively stable at'"
      : "Useful Task 1 General phrases: 'I am writing to express my concern about', 'I would be grateful if you could', 'I am writing with reference to', 'I look forward to hearing from you', 'I would like to bring to your attention', 'I would appreciate it if'";

    const task2Phrases = "Useful Task 2 phrases: 'Furthermore, it is widely acknowledged that', 'To substantiate this claim, one can argue that', 'While critics may contend that', 'This is particularly evident in cases where', 'A compelling argument can be made for', 'It would be remiss to overlook the fact that', 'In contrast, proponents of this view suggest', 'Ultimately, the evidence suggests that'";

    const phraseBank = taskType === "task1" ? task1Phrases : task2Phrases;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      system: "You are an expert IELTS writing tutor. When a student pauses, analyse where they are in their essay and suggest specific phrases to continue. Return only valid JSON.",
      messages: [{
        role: "user",
        content: `IELTS ${taskLabel}
Task prompt: ${prompt || "(not provided)"}

Student's essay so far (${wordCount} words):
"""
${essayForAI}
"""

The student just paused. Identify where they are and suggest what to write next.

${phraseBank}

Return JSON:
{
  "continuation": {
    "position": "intro|body_paragraph_1|body_paragraph_2|body_paragraph_3|conclusion",
    "tip": "<1-2 sentences: specific guidance on what content to add next>",
    "phrases": ["<phrase 1, 8-15 words, ready to continue from>", "<phrase 2>", "<phrase 3>", "<phrase 4>"]
  }
}

Rules:
- phrases must fit as the NEXT sentence given what was written
- use Band 7+ IELTS vocabulary and variety (no two phrases starting the same way)
- match the task type — Task 1 Academic = describing data; Task 2 = argumentation
- for conclusion position, suggest closing/summary phrases
- tip should mention what argument/point to develop, not just generic advice`,
      }],
    });

    const content = response.content[0];
    if (content.type !== "text") return NextResponse.json({ suggestions: [] });

    try {
      const json = JSON.parse(
        content.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()
      );
      // Convert to GuideSuggestion shape
      const cont = json.continuation;
      if (!cont) return NextResponse.json({ suggestions: [] });
      return NextResponse.json({
        suggestions: [{
          type: "continuation",
          tip: cont.tip,
          phrases: cont.phrases,
          position: cont.position,
          excerpt: null,
        }],
      });
    } catch {
      return NextResponse.json({ suggestions: [] });
    }
  }

  // ── ANALYZE MODE — corrections + live band scores ─────────────────────────
  const knownErrorsBlock = knownErrors.length > 0
    ? `\n⚠️ THIS STUDENT'S KNOWN REPEAT MISTAKES (check for these first):\n${knownErrors.map(e => `- ${e}`).join("\n")}`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 900,
    system: `You are an expert IELTS examiner and writing tutor watching a student write in real time. Give specific, encouraging feedback and realistic band score estimates based on what is written so far. Always reference the student's ACTUAL words. Return only valid JSON.`,
    messages: [
      {
        role: "user",
        content: `IELTS ${taskLabel}
Task prompt: ${prompt || "(not yet provided)"}
${knownErrorsBlock}

Student's essay so far (${wordCount} words):
"""
${essayForAI}
"""

Return a JSON object with TWO parts:

PART 1 — Live band score estimate based on what's written so far (be realistic, not generous):
"bandScores": {
  "taskAchievement": <4.0–9.0 in 0.5 steps>,
  "coherenceCohesion": <4.0–9.0 in 0.5 steps>,
  "lexicalResource": <4.0–9.0 in 0.5 steps>,
  "grammaticalRange": <4.0–9.0 in 0.5 steps>,
  "overall": <average of above rounded to nearest 0.5>
}

PART 2 — 3 most critical real-time issues (PRIORITY ORDER):
1. GRAMMAR — subject-verb agreement, tense, articles, plurals
2. VOCABULARY — informal words, weak/vague words, upgrade opportunities
3. REPEATED_WORDS — same word/phrase used 3+ times
4. COHESION — weak/missing connectors, abrupt transitions
5. SENTENCE_VARIETY — same structure/length repeated
6. FORMALITY — contractions, slang, colloquial phrases
7. TASK — missing/weak address of the prompt
8. CLARITY — unclear, ambiguous, or run-on sentences
9. STRUCTURE — weak intro/conclusion, underdeveloped paragraphs

"suggestions": [
  {
    "type": "grammar|vocabulary|repeated_words|cohesion|sentence_variety|formality|task|clarity|structure",
    "tip": "<specific 1-2 sentence advice with concrete IELTS-level alternative>",
    "excerpt": "<exact problematic text from essay or null>"
  }
]

Full response shape:
{
  "bandScores": { "taskAchievement": X, "coherenceCohesion": X, "lexicalResource": X, "grammaticalRange": X, "overall": X },
  "suggestions": [...]
}

Rules:
- Band scores should reflect what's written so far — penalise for low word count
- excerpt must be a direct quote or null
- Be specific: name the exact word to change, give a concrete alternative
- Be encouraging but honest`,
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
