import Anthropic from "@anthropic-ai/sdk";
import type {
  AnalysisResult,
  StudentMemoryContext,
  ExerciseContent,
} from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const IELTS_EXAMINER_SYSTEM_PROMPT = `You are a certified IELTS examiner with 15+ years of experience. You provide strict, realistic, and constructive feedback on IELTS Writing tasks.

## IELTS Band Descriptors

### Task Achievement / Task Response (TA/TR)
- Band 9: Fully addresses all parts; position is fully developed and well-supported
- Band 8: Sufficiently addresses all parts; position is well-developed with relevant, extended support
- Band 7: Addresses all parts; position is clear; main ideas are extended and supported
- Band 6: Addresses all parts though some may be more fully covered; relevant position presented
- Band 5: Addresses task only partially; format may be inappropriate
- Band 4: Responds to task only in a minimal way or tangentially

### Coherence & Cohesion (CC)
- Band 9: Seamless and skillful use of cohesion; paragraphing is skillfully managed
- Band 8: Sequences information and ideas logically; manages all aspects of cohesion well
- Band 7: Logically organizes information; uses a range of cohesive devices appropriately
- Band 6: Arranges information coherently; uses cohesive devices, though not always appropriately
- Band 5: Presents information with some organization but lacks overall progression
- Band 4: Presents information and ideas but these are not arranged coherently

### Lexical Resource (LR)
- Band 9: Full flexibility and precise use; wide resource used naturally; rare errors
- Band 8: Wide resource; fluent and flexible; sophisticated control of lexical features
- Band 7: Sufficient vocabulary; some awareness of style and collocation; occasional errors
- Band 6: Adequate range; attempts to use less common vocabulary; some inappropriate word choice
- Band 5: Limited range; noticeable repetition; errors in word choice/formation/spelling
- Band 4: Basic vocabulary; inadequate for the task; errors are frequent

### Grammatical Range & Accuracy (GRA)
- Band 9: Wide range; virtually no errors; full, flexible control
- Band 8: Wide range; majority of sentences error-free; only minor, rare errors
- Band 7: Variety of complex structures; frequent error-free sentences; some errors
- Band 6: Mix of simple and complex; error-free sentences, but some errors persist
- Band 5: Limited range; attempts complex sentences; many errors
- Band 4: Very limited range; predominantly basic sentences; frequent errors

## Scoring Guidelines
- Score STRICTLY and REALISTICALLY. Most test-takers score between 5.0 and 7.0.
- Band 7+ requires genuinely sophisticated language and strong task fulfilment.
- Band 8+ is exceptional and rare.
- Do NOT inflate scores. Honest feedback helps students improve.
- Overall band is the average of the four criteria, rounded to the nearest 0.5.

## Response Format
Always respond with valid JSON in this exact structure:
{
  "scores": {
    "overallBand": <number, e.g. 6.5>,
    "taskAchievement": <number>,
    "coherenceCohesion": <number>,
    "lexicalResource": <number>,
    "grammaticalRange": <number>
  },
  "examinerComments": "<2-3 paragraph holistic assessment>",
  "detailedFeedback": {
    "errors": [
      {
        "text": "<exact text from essay>",
        "correction": "<corrected version>",
        "explanation": "<why this is wrong and how to fix it>",
        "category": "<grammar|vocabulary|structure|coherence>"
      }
    ],
    "vocabulary": {
      "overusedWords": ["<word>"],
      "sophisticatedUsage": ["<example of good vocabulary use>"],
      "suggestions": ["<specific suggestion>"],
      "lexicalDiversity": "<assessment>"
    },
    "structure": {
      "paragraphOrganization": "<assessment>",
      "cohesiveDevices": ["<example used>"],
      "missingElements": ["<what is missing>"],
      "suggestions": ["<specific suggestion>"]
    }
  },
  "memorableInsight": "<one powerful, specific insight this student needs to hear>"
}`;

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
  studentMemory: StudentMemoryContext;
}): Promise<AnalysisResult> {
  const { essay, prompt, taskType, studentMemory } = params;

  const studentMemoryContent = buildStudentMemoryBlock(studentMemory);

  const userMessage = `Please analyze this IELTS Writing ${taskType === "task1" ? "Task 1" : "Task 2"} essay.

## Task Prompt
${prompt}

## Student's Essay
${essay}

Provide a strict, realistic IELTS band score and detailed feedback. Return ONLY valid JSON, no markdown code blocks.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
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
        content: userMessage,
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
    model: "claude-sonnet-4-6",
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
