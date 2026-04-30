import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStudentMemoryContext } from "@/lib/memory";
import { db } from "@/lib/db";
import { studentMemory, errorPatterns, vocabularyStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memory = await getStudentMemoryContext(session.user.id);
    return NextResponse.json(memory);
  } catch (error) {
    console.error("Get memory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch memory" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset all memory data for user
    await db
      .delete(studentMemory)
      .where(eq(studentMemory.userId, session.user.id));
    await db
      .delete(errorPatterns)
      .where(eq(errorPatterns.userId, session.user.id));
    await db
      .delete(vocabularyStats)
      .where(eq(vocabularyStats.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset memory error:", error);
    return NextResponse.json(
      { error: "Failed to reset memory" },
      { status: 500 }
    );
  }
}
