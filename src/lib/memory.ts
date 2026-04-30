import { db } from "@/lib/db";
import {
  errorPatterns,
  vocabularyStats,
  studentMemory,
  essays,
  users,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type {
  AnalysisResult,
  StudentMemoryContext,
  ErrorCategory,
} from "@/types";

export async function updateStudentMemory(
  userId: string,
  essayId: string,
  analysisResult: AnalysisResult
): Promise<void> {
  const { detailedFeedback, scores } = analysisResult;

  // Update error patterns
  for (const error of detailedFeedback.errors) {
    const normalizedType = normalizeErrorType(error.explanation, error.category);

    const existing = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.userId, userId))
      .then((rows) =>
        rows.find(
          (r) =>
            r.errorType === normalizedType &&
            r.errorCategory === error.category
        )
      );

    if (existing) {
      // Update frequency and add example
      const currentExamples = (existing.examples as Array<{ essayId: string; text: string; correction: string }>) || [];
      const newExamples = [
        ...currentExamples.slice(-4),
        { essayId, text: error.text, correction: error.correction },
      ];

      await db
        .update(errorPatterns)
        .set({
          frequency: (existing.frequency || 0) + 1,
          lastSeenAt: new Date(),
          description: error.explanation,
          examples: newExamples,
        })
        .where(eq(errorPatterns.id, existing.id));
    } else {
      await db.insert(errorPatterns).values({
        userId,
        errorType: normalizedType,
        errorCategory: error.category as ErrorCategory,
        description: error.explanation,
        frequency: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        examples: [{ essayId, text: error.text, correction: error.correction }],
      });
    }
  }

  // Update vocabulary stats for overused words
  for (const word of detailedFeedback.vocabulary.overusedWords) {
    const normalizedWord = word.toLowerCase().trim();
    const existing = await db
      .select()
      .from(vocabularyStats)
      .where(eq(vocabularyStats.userId, userId))
      .then((rows) => rows.find((r) => r.word === normalizedWord));

    if (existing) {
      await db
        .update(vocabularyStats)
        .set({
          frequency: (existing.frequency || 0) + 1,
          isOverused: true,
          lastSeenAt: new Date(),
        })
        .where(eq(vocabularyStats.id, existing.id));
    } else {
      await db.insert(vocabularyStats).values({
        userId,
        word: normalizedWord,
        frequency: 1,
        isOverused: true,
        context: "Flagged as overused",
        lastSeenAt: new Date(),
      });
    }
  }

  // Compute strength and weakness areas from scores
  const strengthAreas: string[] = [];
  const weaknessAreas: string[] = [];

  if (scores.taskAchievement >= 7) strengthAreas.push("Task Achievement");
  else if (scores.taskAchievement < 6) weaknessAreas.push("Task Achievement");

  if (scores.coherenceCohesion >= 7) strengthAreas.push("Coherence & Cohesion");
  else if (scores.coherenceCohesion < 6) weaknessAreas.push("Coherence & Cohesion");

  if (scores.lexicalResource >= 7) strengthAreas.push("Lexical Resource");
  else if (scores.lexicalResource < 6) weaknessAreas.push("Lexical Resource");

  if (scores.grammaticalRange >= 7) strengthAreas.push("Grammatical Range & Accuracy");
  else if (scores.grammaticalRange < 6) weaknessAreas.push("Grammatical Range & Accuracy");

  // Upsert student memory summary
  const existingMemory = await db
    .select()
    .from(studentMemory)
    .where(eq(studentMemory.userId, userId))
    .limit(1);

  const grammarProfile = {
    lastAssessment: scores.grammaticalRange,
    commonErrors: detailedFeedback.errors
      .filter((e) => e.category === "grammar")
      .map((e) => e.explanation)
      .slice(0, 5),
  };

  const vocabularyProfile = {
    lastAssessment: scores.lexicalResource,
    overusedWords: detailedFeedback.vocabulary.overusedWords,
    sophisticatedUsage: detailedFeedback.vocabulary.sophisticatedUsage,
  };

  const structureProfile = {
    lastAssessment: scores.coherenceCohesion,
    cohesiveDevices: detailedFeedback.structure.cohesiveDevices,
    missingElements: detailedFeedback.structure.missingElements,
  };

  const scoringTrends = {
    latestBands: {
      overall: scores.overallBand,
      taskAchievement: scores.taskAchievement,
      coherenceCohesion: scores.coherenceCohesion,
      lexicalResource: scores.lexicalResource,
      grammaticalRange: scores.grammaticalRange,
    },
    lastUpdated: new Date().toISOString(),
  };

  if (existingMemory.length > 0) {
    await db
      .update(studentMemory)
      .set({
        grammarProfile,
        vocabularyProfile,
        structureProfile,
        scoringTrends,
        strengthAreas,
        weaknessAreas,
        updatedAt: new Date(),
      })
      .where(eq(studentMemory.userId, userId));
  } else {
    await db.insert(studentMemory).values({
      userId,
      grammarProfile,
      vocabularyProfile,
      structureProfile,
      scoringTrends,
      strengthAreas,
      weaknessAreas,
      updatedAt: new Date(),
    });
  }

  // Update user's currentBand and totalEssays
  await db
    .update(users)
    .set({
      currentBand: String(scores.overallBand),
      totalEssays: sql`${users.totalEssays} + 1`,
    })
    .where(eq(users.id, userId));
}

export async function getStudentMemoryContext(
  userId: string
): Promise<StudentMemoryContext> {
  // Get last 10 essays' scores
  const recentEssays = await db
    .select({
      essayId: essays.id,
      submittedAt: essays.submittedAt,
      overallBand: essays.overallBand,
      taskAchievement: essays.taskAchievement,
      coherenceCohesion: essays.coherenceCohesion,
      lexicalResource: essays.lexicalResource,
      grammaticalRange: essays.grammaticalRange,
    })
    .from(essays)
    .where(eq(essays.userId, userId))
    .orderBy(desc(essays.submittedAt))
    .limit(10);

  // Get top 10 error patterns by frequency
  const topErrors = await db
    .select()
    .from(errorPatterns)
    .where(eq(errorPatterns.userId, userId))
    .orderBy(desc(errorPatterns.frequency))
    .limit(10);

  // Get vocabulary stats
  const vocabStats = await db
    .select()
    .from(vocabularyStats)
    .where(eq(vocabularyStats.userId, userId))
    .orderBy(desc(vocabularyStats.frequency))
    .limit(20);

  // Get student memory profile
  const memoryProfile = await db
    .select()
    .from(studentMemory)
    .where(eq(studentMemory.userId, userId))
    .limit(1);

  return {
    recentScores: recentEssays.map((e) => ({
      essayId: e.essayId,
      submittedAt: e.submittedAt!,
      overallBand: parseFloat(String(e.overallBand)) || 0,
      taskAchievement: parseFloat(String(e.taskAchievement)) || 0,
      coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
      lexicalResource: parseFloat(String(e.lexicalResource)) || 0,
      grammaticalRange: parseFloat(String(e.grammaticalRange)) || 0,
    })),
    topErrorPatterns: topErrors.map((e) => ({
      id: e.id,
      userId: e.userId,
      errorType: e.errorType,
      errorCategory: e.errorCategory as ErrorCategory,
      description: e.description,
      frequency: e.frequency || 1,
      lastSeenAt: e.lastSeenAt!,
      firstSeenAt: e.firstSeenAt!,
      examples: (e.examples as Array<{ essayId: string; text: string; correction: string }>) || [],
    })),
    vocabularyStats: vocabStats.map((v) => ({
      id: v.id,
      userId: v.userId,
      word: v.word,
      frequency: v.frequency || 1,
      isOverused: v.isOverused || false,
      context: v.context || "",
      lastSeenAt: v.lastSeenAt!,
    })),
    memoryProfile:
      memoryProfile.length > 0
        ? {
            id: memoryProfile[0].id,
            userId: memoryProfile[0].userId,
            grammarProfile:
              (memoryProfile[0].grammarProfile as Record<string, unknown>) ||
              {},
            vocabularyProfile:
              (memoryProfile[0].vocabularyProfile as Record<
                string,
                unknown
              >) || {},
            structureProfile:
              (memoryProfile[0].structureProfile as Record<string, unknown>) ||
              {},
            scoringTrends:
              (memoryProfile[0].scoringTrends as Record<string, unknown>) || {},
            strengthAreas:
              (memoryProfile[0].strengthAreas as string[]) || [],
            weaknessAreas:
              (memoryProfile[0].weaknessAreas as string[]) || [],
            updatedAt: memoryProfile[0].updatedAt!,
          }
        : null,
  };
}

function normalizeErrorType(explanation: string, category: string): string {
  const lower = explanation.toLowerCase();

  // Grammar patterns
  if (lower.includes("article") || lower.includes(" a ") || lower.includes(" an ") || lower.includes(" the ")) {
    return "article usage";
  }
  if (lower.includes("subject-verb") || lower.includes("subject verb") || lower.includes("agreement")) {
    return "subject-verb agreement";
  }
  if (lower.includes("tense") || lower.includes("past") || lower.includes("present") || lower.includes("future")) {
    return "tense consistency";
  }
  if (lower.includes("preposition") || lower.includes("in the") || lower.includes("on the") || lower.includes("at the")) {
    return "preposition usage";
  }
  if (lower.includes("plural") || lower.includes("singular")) {
    return "noun number agreement";
  }
  if (lower.includes("relative clause") || lower.includes("which") || lower.includes("who") || lower.includes("that")) {
    return "relative clause";
  }
  if (lower.includes("comma") || lower.includes("semicolon") || lower.includes("punctuation")) {
    return "punctuation";
  }
  if (lower.includes("parallel") || lower.includes("parallelism")) {
    return "parallel structure";
  }

  // Vocabulary patterns
  if (lower.includes("collocation") || lower.includes("word combination")) {
    return "collocation error";
  }
  if (lower.includes("word choice") || lower.includes("inappropriate word")) {
    return "inappropriate word choice";
  }
  if (lower.includes("repetiti") || lower.includes("overused")) {
    return "vocabulary repetition";
  }
  if (lower.includes("formal") || lower.includes("informal") || lower.includes("register")) {
    return "register/formality";
  }

  // Structure patterns
  if (lower.includes("transition") || lower.includes("linking") || lower.includes("connective")) {
    return "cohesive device misuse";
  }
  if (lower.includes("paragraph") || lower.includes("topic sentence")) {
    return "paragraph structure";
  }

  // Default: use category + first few words of explanation
  const words = explanation.split(" ").slice(0, 3).join(" ");
  return `${category}: ${words}`.toLowerCase().slice(0, 50);
}
