import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription as Stripe.Subscription | null)?.id ?? null;

        await db
          .update(users)
          .set({
            plan: "pro",
            stripeSubscriptionId: subscriptionId,
            // planExpiresAt: null means "active until cancelled"
            planExpiresAt: null,
          })
          .where(eq(users.id, userId));

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : (sub.customer as Stripe.Customer).id;

        const isActive = sub.status === "active" || sub.status === "trialing";
        // Use cancel_at as expiry if set, otherwise null (runs indefinitely until cancelled)
        const planExpiresAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;

        await db
          .update(users)
          .set({
            plan: isActive ? "pro" : "free",
            stripeSubscriptionId: sub.id,
            planExpiresAt: isActive ? planExpiresAt : null,
          })
          .where(eq(users.stripeCustomerId, customerId));

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : (sub.customer as Stripe.Customer).id;

        await db
          .update(users)
          .set({
            plan: "free",
            stripeSubscriptionId: null,
            planExpiresAt: null,
          })
          .where(eq(users.stripeCustomerId, customerId));

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
