import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 60; // Vercel hobby plan max
import { exercises, users } from "@/lib/db/schema";
import { generateExercises } from "@/lib/claude";
import { getStudentMemoryContext } from "@/lib/memory";
import { eq, desc, gte, count } from "drizzle-orm";

// Free: monthly limit. Pro: daily limit. Each generation = 3 exercises.
const FREE_MONTHLY_GENERATIONS = 3;  // 9 exercises/month
const PRO_DAILY_GENERATIONS    = 5;  // 15 exercises/day

async function getMonthlyGenerationCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ value: count() })
    .from(exercises)
    .where(eq(exercises.userId, userId) && gte(exercises.generatedAt, startOfMonth) as never);
  return Math.floor((result?.value ?? 0) / 3);
}

async function getDailyGenerationCount(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [result] = await db
    .select({ value: count() })
    .from(exercises)
    .where(eq(exercises.userId, userId) && gte(exercises.generatedAt, startOfDay) as never);
  return Math.floor((result?.value ?? 0) / 3);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Check plan & generation limit ────────────────────────────────────
    const [user] = await db
      .select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const isActivePro =
      user?.plan === "pro" &&
      (user.planExpiresAt == null || user.planExpiresAt > new Date());

    if (isActivePro) {
      const dailyUsed = await getDailyGenerationCount(session.user.id);
      if (dailyUsed >= PRO_DAILY_GENERATIONS) {
        return NextResponse.json(
          {
            error: `Daily limit reached — you've generated exercises ${dailyUsed} times today (max ${PRO_DAILY_GENERATIONS}).`,
            limitReached: true,
            plan: "pro",
          },
          { status: 429 }
        );
      }
    } else {
      const monthlyUsed = await getMonthlyGenerationCount(session.user.id);
      if (monthlyUsed >= FREE_MONTHLY_GENERATIONS) {
        return NextResponse.json(
          {
            error: `Free plan allows ${FREE_MONTHLY_GENERATIONS} exercise generations per month. Upgrade to Pro for more.`,
            limitReached: true,
            plan: "free",
          },
          { status: 429 }
        );
      }
    }

    // ── Generate ──────────────────────────────────────────────────────────
    const studentMemory = await getStudentMemoryContext(session.user.id);

    const targetErrors =
      studentMemory.topErrorPatterns.slice(0, 5).map((e) => e.errorType);

    if (targetErrors.length === 0) {
      targetErrors.push("article usage", "sentence variety", "cohesive devices");
    }

    const generatedExercises = await generateExercises({ studentMemory, targetErrors });

    const savedExercises = [];
    for (const ex of generatedExercises) {
      const exerciseType =
        ex.targetSkill?.toLowerCase().includes("grammar")   ? "grammar"
        : ex.targetSkill?.toLowerCase().includes("vocab")   ? "vocabulary"
        : ex.targetSkill?.toLowerCase().includes("struct")  ? "structure"
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

export async function GET(_req: NextRequest) {
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
