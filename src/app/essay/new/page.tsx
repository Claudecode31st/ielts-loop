import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canSubmitEssay } from "@/lib/usage";
import { getStudentMemoryContext } from "@/lib/memory";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import EssayForm from "./essay-form";

const FREE_MONTHLY_PROMPTS = 10;

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function NewEssayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // Fetch all three data sources in parallel — no client-side loading flash
  const [usageResult, userRow, memory] = await Promise.all([
    canSubmitEssay(session.user.id),
    db.select({ plan: users.plan, planExpiresAt: users.planExpiresAt, promptCount: users.promptCount, promptMonthKey: users.promptMonthKey })
      .from(users).where(eq(users.id, session.user.id)).limit(1),
    getStudentMemoryContext(session.user.id),
  ]);

  const { used, limit, plan } = usageResult;

  // Resolve prompt usage (mirrors /api/prompt GET logic)
  const user = userRow[0];
  const isActivePro = user?.plan === "pro" && (user.planExpiresAt == null || user.planExpiresAt > new Date());
  const monthKey = currentMonthKey();
  const promptUsed = user?.promptMonthKey === monthKey ? (user.promptCount ?? 0) : 0;
  const promptLimit: number | null = isActivePro ? null : FREE_MONTHLY_PROMPTS;

  const knownErrors = (memory.topErrorPatterns ?? [])
    .slice(0, 6)
    .map((e) => e.errorType);

  return (
    <EssayForm
      initialUsage={{ used, limit: limit === Infinity ? 999 : limit, plan }}
      initialPromptUsage={{ used: promptUsed, limit: promptLimit }}
      initialKnownErrors={knownErrors}
    />
  );
}
