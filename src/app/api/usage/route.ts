import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canSubmitEssay } from "@/lib/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { used, limit, plan } = await canSubmitEssay(session.user.id);

  return NextResponse.json({ used, limit, plan });
}
