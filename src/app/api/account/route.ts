import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select({
        stripeSubscriptionId: users.stripeSubscriptionId,
        plan: users.plan,
        planExpiresAt: users.planExpiresAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    // Cancel active Stripe subscription before deleting so they aren't billed again
    const isActivePro =
      user?.plan === "pro" &&
      (user.planExpiresAt == null || user.planExpiresAt > new Date());

    if (isActivePro && user?.stripeSubscriptionId) {
      try {
        await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
      } catch {
        // Log but don't block deletion if Stripe cancel fails
        console.error("Failed to cancel Stripe subscription during account deletion");
      }
    }

    // Delete user — cascade removes essays, exercises, error patterns,
    // vocabulary stats, student memory, accounts, and sessions automatically.
    await db.delete(users).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
