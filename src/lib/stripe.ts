import Stripe from "stripe";

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export const FREE_ESSAY_LIMIT = 2;

export const PLANS = {
  free: { essays: FREE_ESSAY_LIMIT },
  pro: { essays: Infinity, priceId: process.env.STRIPE_PRO_PRICE_ID! },
};
