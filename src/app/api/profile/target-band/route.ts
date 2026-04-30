import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetBand } = await req.json();

    if (typeof targetBand !== "number" || targetBand < 1 || targetBand > 9) {
      return NextResponse.json(
        { error: "Invalid target band. Must be between 1 and 9." },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ targetBand: String(targetBand) })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update target band error:", error);
    return NextResponse.json(
      { error: "Failed to update target band" },
      { status: 500 }
    );
  }
}
