import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 60; // Vercel hobby plan max
import { essays } from "@/lib/db/schema";
import { analyzeEssay } from "@/lib/claude";
import { updateStudentMemory, getStudentMemoryContext } from "@/lib/memory";
import { countWords } from "@/lib/utils";
import { canSubmitEssay } from "@/lib/usage";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed, used, limit, plan } = await canSubmitEssay(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Essay limit reached",
          used,
          limit,
          plan,
          upgradeUrl: "/pricing",
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { essay, prompt, taskType, ieltsMode, imageBase64, imageMime } = body;

    if (!essay || !prompt || !taskType) {
      return NextResponse.json(
        { error: "Missing required fields: essay, prompt, taskType" },
        { status: 400 }
      );
    }

    if (taskType !== "task1" && taskType !== "task2") {
      return NextResponse.json(
        { error: "taskType must be 'task1' or 'task2'" },
        { status: 400 }
      );
    }

    const wordCount = countWords(essay);
    const minWords = taskType === "task1" ? 150 : 250;
    if (wordCount < minWords * 0.8) {
      return NextResponse.json(
        {
          error: `Essay is too short. ${taskType === "task1" ? "Task 1" : "Task 2"} requires at least ${minWords} words.`,
        },
        { status: 400 }
      );
    }

    // Get student memory context for personalized analysis
    const studentMemory = await getStudentMemoryContext(session.user.id);

    // Analyze with Claude
    const analysis = await analyzeEssay({
      essay,
      prompt,
      taskType,
      ieltsMode: ieltsMode ?? "academic",
      studentMemory,
      imageBase64: imageBase64 ?? undefined,
      imageMime: imageMime ?? "image/jpeg",
    });

    // Save essay to DB
    const [savedEssay] = await db
      .insert(essays)
      .values({
        userId: session.user.id,
        taskType,
        prompt,
        content: essay,
        wordCount,
        overallBand: String(analysis.scores.overallBand),
        taskAchievement: String(analysis.scores.taskAchievement),
        coherenceCohesion: String(analysis.scores.coherenceCohesion),
        lexicalResource: String(analysis.scores.lexicalResource),
        grammaticalRange: String(analysis.scores.grammaticalRange),
        feedbackSummary: analysis.memorableInsight,
        detailedFeedback: analysis.detailedFeedback as unknown as Record<string, unknown>,
        examinerComments: analysis.examinerComments,
      })
      .returning();

    // Update student memory
    await updateStudentMemory(
      session.user.id,
      savedEssay.id,
      analysis
    );

    return NextResponse.json({
      essayId: savedEssay.id,
      analysis,
    });
  } catch (error) {
    console.error("Essay analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze essay. Please try again." },
      { status: 500 }
    );
  }
}
