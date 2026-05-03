import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 60; // Vercel hobby plan max
import { exercises, users, essays } from "@/lib/db/schema";
import { generateExercises } from "@/lib/claude";
import { getStudentMemoryContext } from "@/lib/memory";
import { eq, desc, gte, count, and } from "drizzle-orm";
import { checkIsPro } from "@/lib/is-pro";

// Free: monthly limit. Pro: daily limit. Each generation = 3 exercises.
const FREE_MONTHLY_GENERATIONS = 3;  // 9 exercises/month
const PRO_DAILY_GENERATIONS    = 5;  // 15 exercises/day

async function getMonthlyGenerationCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ value: count() })
    .from(exercises)
    .where(and(eq(exercises.userId, userId), gte(exercises.generatedAt, startOfMonth)));
  return Math.floor((result?.value ?? 0) / 3);
}

async function getDailyGenerationCount(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [result] = await db
    .select({ value: count() })
    .from(exercises)
    .where(and(eq(exercises.userId, userId), gte(exercises.generatedAt, startOfDay)));
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

    const isActivePro = checkIsPro(user, session.user.email);

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

    // ── Require at least one essay ────────────────────────────────────────
    const [essayCount] = await db
      .select({ value: count() })
      .from(essays)
      .where(eq(essays.userId, session.user.id));

    if ((essayCount?.value ?? 0) === 0) {
      return NextResponse.json(
        {
          error: "Submit at least one essay first. Exercises are personalised to your actual mistakes — without an essay there's nothing to target.",
          noEssays: true,
        },
        { status: 400 }
      );
    }

    // ── Generate ──────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const focus: string | undefined = body.focus;

    const studentMemory = await getStudentMemoryContext(session.user.id);

    // If a specific topic was requested (from the error-pattern CTA), target only that.
    // Otherwise fall back to the student's top error patterns.
    const targetErrors: string[] = focus
      ? [focus]
      : studentMemory.topErrorPatterns.slice(0, 5).map((e) => e.errorType);

    // If essays exist but patterns aren't extracted yet, use broad IELTS areas
    if (targetErrors.length === 0) {
      targetErrors.push("grammatical range", "lexical resource", "coherence and cohesion");
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

export async function DELETE(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(exercises).where(eq(exercises.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear exercises error:", error);
    return NextResponse.json(
      { error: "Failed to clear exercises" },
      { status: 500 }
    );
  }
}
