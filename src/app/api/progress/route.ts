import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const essayHistory = await db
      .select({
        id: essays.id,
        submittedAt: essays.submittedAt,
        overallBand: essays.overallBand,
        taskAchievement: essays.taskAchievement,
        coherenceCohesion: essays.coherenceCohesion,
        lexicalResource: essays.lexicalResource,
        grammaticalRange: essays.grammaticalRange,
      })
      .from(essays)
      .where(eq(essays.userId, session.user.id))
      .orderBy(essays.submittedAt)
      .limit(50);

    const progressData = essayHistory.map((e) => ({
      date: format(new Date(e.submittedAt!), "MMM d"),
      overallBand: parseFloat(String(e.overallBand)) || 0,
      taskAchievement: parseFloat(String(e.taskAchievement)) || 0,
      coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
      lexicalResource: parseFloat(String(e.lexicalResource)) || 0,
      grammaticalRange: parseFloat(String(e.grammaticalRange)) || 0,
    }));

    return NextResponse.json({ progress: progressData });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
