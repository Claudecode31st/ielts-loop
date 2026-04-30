import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 60; // Vercel hobby plan max
import { exercises, errorPatterns } from "@/lib/db/schema";
import { generateExercises } from "@/lib/claude";
import { getStudentMemoryContext } from "@/lib/memory";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentMemory = await getStudentMemoryContext(session.user.id);

    // Get top error types to target
    const targetErrors =
      studentMemory.topErrorPatterns
        .slice(0, 5)
        .map((e) => e.errorType) || [];

    if (targetErrors.length === 0) {
      targetErrors.push(
        "article usage",
        "sentence variety",
        "cohesive devices"
      );
    }

    const generatedExercises = await generateExercises({
      studentMemory,
      targetErrors,
    });

    // Save exercises to DB
    const savedExercises = [];
    for (const ex of generatedExercises) {
      const exerciseType =
        ex.targetSkill?.toLowerCase().includes("grammar")
          ? "grammar"
          : ex.targetSkill?.toLowerCase().includes("vocab")
          ? "vocabulary"
          : ex.targetSkill?.toLowerCase().includes("struct")
          ? "structure"
          : "coherence";

      const [saved] = await db
        .insert(exercises)
        .values({
          userId: session.user.id,
          exerciseType,
          targetError: ex.targetSkill || targetErrors[0],
          content: ex as unknown as Record<string, unknown>,
          isCompleted: false,
        })
        .returning();

      savedExercises.push(saved);
    }

    return NextResponse.json({ exercises: savedExercises });
  } catch (error) {
    console.error("Generate exercises error:", error);
    return NextResponse.json(
      { error: "Failed to generate exercises" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exerciseList = await db
      .select()
      .from(exercises)
      .where(eq(exercises.userId, session.user.id))
      .orderBy(desc(exercises.generatedAt))
      .limit(20);

    return NextResponse.json({ exercises: exerciseList });
  } catch (error) {
    console.error("List exercises error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}
