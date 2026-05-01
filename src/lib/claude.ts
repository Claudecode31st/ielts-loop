import Anthropic from "@anthropic-ai/sdk";
import type {
  AnalysisResult,
  StudentMemoryContext,
  ExerciseContent,
} from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const IELTS_EXAMINER_SYSTEM_PROMPT = `You are a strict, experienced IELTS examiner. Score REALISTICALLY (most test-takers: 5.0–7.0). Band 7+ needs genuinely sophisticated language. Do NOT inflate scores. Overall = average of 4 criteria, rounded to nearest 0.5.

IELTS Band Descriptors (key levels):
TA/TR: 9=fully addresses+fully developed | 7=addresses all+clear position | 6=addresses all though some parts less covered | 5=partial only
CC: 9=seamless cohesion | 7=logical+range of cohesive devices | 6=coherent but devices not always appropriate | 5=some organization,lacks progression
LR: 9=full flexibility,rare errors | 7=sufficient+aware of collocation | 6=adequate+some inappropriate word choice | 5=limited+noticeable repetition
GRA: 9=wide range,virtually no errors | 7=variety of complex,frequent error-free | 6=mix simple/complex,some errors persist | 5=limited,many errors

Respond ONLY with valid JSON — no markdown, no prose outside JSON:
{"scores":{"overallBand":6.5,"taskAchievement":6.5,"coherenceCohesion":6.0,"lexicalResource":6.5,"grammaticalRange":6.0},"examinerComments":"<2 paragraphs>","detailedFeedback":{"errors":[{"text":"<exact text>","correction":"<fix>","explanation":"<brief why>","category":"grammar|vocabulary|structure|coherence"}],"vocabulary":{"overusedWords":["word"],"sophisticatedUsage":["example"],"suggestions":["tip"],"lexicalDiversity":"<1 sentence>"},"structure":{"paragraphOrganization":"<1 sentence>","cohesiveDevices":["example"],"missingElements":["item"],"suggestions":["tip"]}},"memorableInsight":"<one specific actionable insight>"}`;

function buildStudentMemoryBlock(
  studentMemory: StudentMemoryContext
): string {
  if (!studentMemory) return "No previous essays on record.";

  const lines: string[] = [];

  if (studentMemory.recentScores && studentMemory.recentScores.length > 0) {
    lines.push("## Student's Score History (Most Recent First)");
    studentMemory.recentScores.forEach((s, i) => {
      lines.push(
        `Essay ${i + 1}: Overall ${s.overallBand} | TA: ${s.taskAchievement} | CC: ${s.coherenceCohesion} | LR: ${s.lexicalResource} | GRA: ${s.grammaticalRange} (${new Date(s.submittedAt).toLocaleDateString()})`
      );
    });
    lines.push("");
  }

  if (
    studentMemory.topErrorPatterns &&
    studentMemory.topErrorPatterns.length > 0
  ) {
    lines.push("## Recurring Error Patterns (CRITICAL - Reference These)");
    studentMemory.topErrorPatterns.forEach((pattern) => {
      lines.push(
        `- [${pattern.errorCategory.toUpperCase()}] ${pattern.errorType}: ${pattern.description} (seen ${pattern.frequency} time${pattern.frequency > 1 ? "s" : ""})`
      );
      if (pattern.examples && pattern.examples.length > 0) {
        const ex = pattern.examples[pattern.examples.length - 1];
        lines.push(`  Example: "${ex.text}" → "${ex.correction}"`);
      }
    });
    lines.push("");
  }

  if (
    studentMemory.memoryProfile?.strengthAreas &&
    studentMemory.memoryProfile.strengthAreas.length > 0
  ) {
    lines.push("## Known Strengths");
    lines.push(studentMemory.memoryProfile.strengthAreas.join(", "));
    lines.push("");
  }

  if (
    studentMemory.memoryProfile?.weaknessAreas &&
    studentMemory.memoryProfile.weaknessAreas.length > 0
  ) {
    lines.push("## Known Weaknesses");
    lines.push(studentMemory.memoryProfile.weaknessAreas.join(", "));
    lines.push("");
  }

  if (
    studentMemory.vocabularyStats &&
    studentMemory.vocabularyStats.length > 0
  ) {
    const overused = studentMemory.vocabularyStats
      .filter((v) => v.isOverused)
      .map((v) => v.word);
    if (overused.length > 0) {
      lines.push("## Overused Vocabulary");
      lines.push(overused.join(", "));
      lines.push("");
    }
  }

  lines.push(
    "## IMPORTANT: If you see any of the student's recurring errors in this essay, explicitly note: \"This is a recurring issue — you have made this mistake in [N] previous essays.\" This longitudinal feedback is critical for improvement."
  );

  return lines.join("\n");
}

export async function analyzeEssay(params: {
  essay: string;
  prompt: string;
  taskType: "task1" | "task2";
  ieltsMode?: "academic" | "general";
  studentMemory: StudentMemoryContext;
  imageBase64?: string;
  imageMime?: string;
}): Promise<AnalysisResult> {
  const { essay, prompt, taskType, ieltsMode = "academic", studentMemory, imageBase64, imageMime = "image/jpeg" } = params;

  const studentMemoryContent = buildStudentMemoryBlock(studentMemory);

  const taskLabel = taskType === "task1"
    ? `Task 1 (${ieltsMode === "academic" ? "Academic — describe a chart/graph/diagram" : "General Training — write a letter"})`
    : "Task 2 (Essay)";

  const textPrompt = `Please analyze this IELTS Writing ${taskLabel} response.

## Task Prompt
${prompt}

## Student's Essay
${essay}
${imageBase64 ? "\n[A chart/graph image has been provided above. Use it to assess how accurately the student described the visual data.]" : ""}

Provide a strict, realistic IELTS band score and detailed feedback. Return ONLY valid JSON, no markdown code blocks.`;

  // Build user message content — include image if provided
  type AllowedMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  const safeMime: AllowedMime = (["image/jpeg","image/png","image/gif","image/webp"].includes(imageMime)
    ? imageMime : "image/jpeg") as AllowedMime;

  type ContentBlock =
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: AllowedMime; data: string } };

  const userContent: ContentBlock[] = [];
  if (imageBase64) {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: safeMime, data: imageBase64 },
    });
  }
  userContent.push({ type: "text", text: textPrompt });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1800,
    system: [
      {
        type: "text",
        text: IELTS_EXAMINER_SYSTEM_PROMPT,
      },
      {
        type: "text",
        text: `## Student Memory Profile\n\n${studentMemoryContent}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  let parsed: AnalysisResult;
  try {
    // Strip any markdown code blocks if present
    const jsonText = content.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${content.text.substring(0, 200)}`);
  }

  return parsed;
}

export async function generateExercises(params: {
  studentMemory: StudentMemoryContext;
  targetErrors: string[];
}): Promise<ExerciseContent[]> {
  const { studentMemory, targetErrors } = params;

  const studentMemoryContent = buildStudentMemoryBlock(studentMemory);

  const prompt = `Based on this IELTS student's error patterns, generate exactly 3 targeted practice exercises.

## Student's Profile
${studentMemoryContent}

## Target Error Types to Address
${targetErrors.join(", ")}

Generate 3 exercises that directly address these weaknesses. Each exercise should be practical and IELTS-focused.

Return ONLY a valid JSON array with exactly 3 exercise objects:
[
  {
    "title": "<exercise title>",
    "instructions": "<clear instructions for the student>",
    "targetSkill": "<specific skill being practiced>",
    "questions": [
      {
        "id": 1,
        "question": "<question text>",
        "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
        "correctAnswer": "<correct option>",
        "explanation": "<why this is correct>"
      }
    ]
  }
]

Make exercises varied: include at least one grammar correction exercise, one vocabulary/collocation exercise, and one structure/organization exercise. Each exercise should have 4-5 questions.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 3000,
    system: [
      {
        type: "text",
        text: "You are an expert IELTS tutor creating targeted practice exercises. Return only valid JSON arrays, no markdown.",
      },
      {
        type: "text",
        text: `## Student Memory Profile\n\n${studentMemoryContent}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  try {
    const jsonText = content.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(jsonText);
  } catch {
    throw new Error("Failed to parse exercises response as JSON");
  }
}
