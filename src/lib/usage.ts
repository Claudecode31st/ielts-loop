import { db } from "@/lib/db";
import { essays, users } from "@/lib/db/schema";
import { and, eq, gte, count } from "drizzle-orm";
import { FREE_ESSAY_LIMIT } from "@/lib/stripe";

const PRO_DAILY_LIMIT = 5;

export async function getMonthlyEssayCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await db
    .select({ value: count() })
    .from(essays)
    .where(and(eq(essays.userId, userId), gte(essays.submittedAt, startOfMonth)));

  return result?.value ?? 0;
}

export async function getDailyEssayCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [result] = await db
    .select({ value: count() })
    .from(essays)
    .where(and(eq(essays.userId, userId), gte(essays.submittedAt, startOfDay)));

  return result?.value ?? 0;
}

export async function canSubmitEssay(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
  reason?: "monthly_limit" | "daily_limit";
}> {
  const [user] = await db
    .select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const plan = user?.plan ?? "free";
  const isActivePro =
    plan === "pro" &&
    (user?.planExpiresAt == null || user.planExpiresAt > new Date());

  if (isActivePro) {
    const used = await getMonthlyEssayCount(userId);
    // Pro: enforce daily limit to prevent abuse
    const dailyUsed = await getDailyEssayCount(userId);
    if (dailyUsed >= PRO_DAILY_LIMIT) {
      return { allowed: false, used, limit: Infinity, plan: "pro", reason: "daily_limit" };
    }
    return { allowed: true, used, limit: Infinity, plan: "pro" };
  }

  // Free plan: monthly limit
  const used = await getMonthlyEssayCount(userId);
  const limit = FREE_ESSAY_LIMIT;
  const allowed = used < limit;

  return { allowed, used, limit, plan: "free", ...(!allowed && { reason: "monthly_limit" }) };
}
