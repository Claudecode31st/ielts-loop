import { PricingCards, CostComparison } from "@/components/pricing-cards";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Pricing</p>
          <h1 className="text-4xl font-bold text-slate-900">Start free. Upgrade when you&apos;re serious.</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Every plan includes AI feedback, error memory, and targeted exercises.
            Pro removes the limits — so nothing slows your preparation down.
          </p>
        </div>

        {/* Cards */}
        <PricingCards />

        {/* Cost comparison */}
        <div className="space-y-4">
          <p className="text-center text-sm font-semibold text-slate-500">How it compares</p>
          <CostComparison />
        </div>

        <p className="text-center text-xs text-slate-400">
          Cancel anytime · Billed monthly · Prices in USD · 7-day money-back guarantee on Pro
        </p>

      </div>
    </div>
  );
}
