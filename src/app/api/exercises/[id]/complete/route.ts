import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { score } = body;

    const [updated] = await db
      .update(exercises)
      .set({
        isCompleted: true,
        score: typeof score === "number" ? score : null,
        completedAt: new Date(),
      })
      .where(
        and(eq(exercises.id, id), eq(exercises.userId, session.user.id))
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ exercise: updated });
  } catch (error) {
    console.error("Complete exercise error:", error);
    return NextResponse.json(
      { error: "Failed to complete exercise" },
      { status: 500 }
    );
  }
}
