import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const essay = await db
      .select()
      .from(essays)
      .where(and(eq(essays.id, id), eq(essays.userId, session.user.id)))
      .limit(1);

    if (essay.length === 0) {
      return NextResponse.json({ error: "Essay not found" }, { status: 404 });
    }

    return NextResponse.json(essay[0]);
  } catch (error) {
    console.error("Get essay error:", error);
    return NextResponse.json(
      { error: "Failed to fetch essay" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deleted = await db
      .delete(essays)
      .where(and(eq(essays.id, id), eq(essays.userId, session.user.id)))
      .returning({ id: essays.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Essay not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete essay error:", error);
    return NextResponse.json(
      { error: "Failed to delete essay" },
      { status: 500 }
    );
  }
}
