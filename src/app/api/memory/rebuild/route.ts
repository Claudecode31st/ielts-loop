import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  essays,
  errorPatterns,
  vocabularyStats,
  studentMemory,
  users,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { updateStudentMemory } from "@/lib/memory";
import type { DetailedFeedback, AnalysisResult } from "@/types";

export const maxDuration = 60;

/**
 * POST /api/memory/rebuild
 *
 * Wipes the student's error-pattern memory and re-runs updateStudentMemory()
 * for every essay they've already submitted — using the fixed normalisation
 * logic. This corrects the "all errors = article usage" bug without requiring
 * the student to resubmit essays.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Wipe existing (broken) memory data and reset essay counter to 0
    // so updateStudentMemory can recount correctly from scratch
    await db.delete(errorPatterns).where(eq(errorPatterns.userId, userId));
    await db.delete(vocabularyStats).where(eq(vocabularyStats.userId, userId));
    await db.delete(studentMemory).where(eq(studentMemory.userId, userId));
    await db.update(users).set({ totalEssays: 0 }).where(eq(users.id, userId));

    // 2. Fetch all of the user's essays (oldest first so memory builds naturally)
    const userEssays = await db
      .select()
      .from(essays)
      .where(eq(essays.userId, userId))
      .orderBy(asc(essays.submittedAt));

    // 3. Re-run updateStudentMemory for each essay using saved detailedFeedback
    let processed = 0;
    for (const essay of userEssays) {
      if (!essay.detailedFeedback) continue;

      const feedback = essay.detailedFeedback as unknown as DetailedFeedback;

      // Reconstruct a minimal AnalysisResult from stored data
      const analysisResult: AnalysisResult = {
        scores: {
          overallBand: parseFloat(String(essay.overallBand)) || 0,
          taskAchievement: parseFloat(String(essay.taskAchievement)) || 0,
          coherenceCohesion: parseFloat(String(essay.coherenceCohesion)) || 0,
          lexicalResource: parseFloat(String(essay.lexicalResource)) || 0,
          grammaticalRange: parseFloat(String(essay.grammaticalRange)) || 0,
        },
        examinerComments: essay.examinerComments || "",
        detailedFeedback: feedback,
        memorableInsight: essay.feedbackSummary || "",
      };

      await updateStudentMemory(userId, essay.id, analysisResult);
      processed++;
    }

    return NextResponse.json({
      success: true,
      essaysReprocessed: processed,
    });
  } catch (error) {
    console.error("Rebuild memory error:", error);
    return NextResponse.json(
      { error: "Failed to rebuild memory" },
      { status: 500 }
    );
  }
}
