import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const essayList = await db
      .select({
        id: essays.id,
        taskType: essays.taskType,
        prompt: essays.prompt,
        wordCount: essays.wordCount,
        submittedAt: essays.submittedAt,
        overallBand: essays.overallBand,
        taskAchievement: essays.taskAchievement,
        coherenceCohesion: essays.coherenceCohesion,
        lexicalResource: essays.lexicalResource,
        grammaticalRange: essays.grammaticalRange,
        feedbackSummary: essays.feedbackSummary,
      })
      .from(essays)
      .where(eq(essays.userId, session.user.id))
      .orderBy(desc(essays.submittedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      essays: essayList,
      page,
      limit,
    });
  } catch (error) {
    console.error("List essays error:", error);
    return NextResponse.json(
      { error: "Failed to fetch essays" },
      { status: 500 }
    );
  }
}
