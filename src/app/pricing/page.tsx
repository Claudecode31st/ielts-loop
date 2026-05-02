import Link from "next/link";
import { Check } from "lucide-react";
import { UpgradeButton } from "@/components/upgrade-button";

const freeFeatures = [
  "2 essays per month",
  "AI examiner feedback",
  "Error pattern tracking",
  "Personalised exercises",
];

const proFeatures = [
  "Unlimited essays (up to 5/day)",
  "Everything in Free",
  "Priority AI processing",
  "Full analytics & progress charts",
  "Error pattern memory across all essays",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">Simple, transparent pricing</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 flex flex-col gap-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-sm text-slate-500">Perfect for getting started.</p>
            </div>

            <ul className="space-y-3 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/essay/new"
              className="w-full text-center rounded-xl border border-[var(--border)] bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm py-2.5 transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl border-2 border-brand-600 p-8 flex flex-col gap-6 relative shadow-lg shadow-brand-100">
            {/* Most Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-brand-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                Most Popular
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$12</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-sm text-slate-500">For serious IELTS preparation.</p>
            </div>

            <ul className="space-y-3 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <UpgradeButton className="w-full bg-brand-600 hover:bg-brand-700 text-white border-0 justify-center" />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Cancel anytime. Billed monthly. Prices in USD.
        </p>
      </div>
    </div>
  );
}
