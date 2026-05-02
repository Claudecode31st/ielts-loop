import Link from "next/link";
import { Check, X, Zap, Brain, BarChart3, PenLine } from "lucide-react";
import { UpgradeButton } from "@/components/upgrade-button";

const FREE_INCLUDED = [
  "AI examiner feedback on every essay",
  "All 4 IELTS criteria scored",
  "AI error memory & score blocker tracking",
  "Targeted practice exercises",
  "Task 1 & Task 2 (images supported)",
  "5 guided writing sessions per day",
];

const FREE_LIMITS = [
  "2 essays per month",
  "2 essays per day",
  "5 guided writing sessions per day",
  "No band score progress charts",
  "No full essay history",
];

const PRO_UPGRADES = [
  { icon: PenLine,   label: "Unlimited essays",               sub: "up to 5 per day, every month" },
  { icon: Zap,       label: "50 guided writing sessions/day", sub: "live AI coaching as you write" },
  { icon: Brain,     label: "Full AI error memory",           sub: "patterns tracked across all essays" },
  { icon: BarChart3, label: "Complete progress analytics",    sub: "band charts, trends, full history" },
];

const PRO_NO_LIMITS = [
  "Unlimited essays per month",
  "5 essays per day",
  "50 guided writing sessions/day",
  "Full band score progress charts",
  "Complete essay history & trends",
  "Per-criterion improvement tracking",
];

export function PricingCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

      {/* Free */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col gap-5">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Free</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-slate-900">$0</span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
          <p className="text-sm text-slate-500">Try everything. No card needed.</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What&apos;s included</p>
          <ul className="space-y-2.5">
            {FREE_INCLUDED.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Plan limits</p>
          <ul className="space-y-2">
            {FREE_LIMITS.map((l) => (
              <li key={l} className="flex items-start gap-2.5 text-sm text-slate-400">
                <X className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                {l}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/essay/new"
          className="mt-auto w-full text-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-2.5 transition-colors"
        >
          Get started free
        </Link>
      </div>

      {/* Pro */}
      <div className="bg-white rounded-2xl border-2 border-brand-600 p-7 flex flex-col gap-5 relative shadow-lg shadow-brand-100/60">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
            Best for exam prep
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Pro</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-slate-900">$12</span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
          <p className="text-sm text-slate-500">Everything in Free, plus no limits.</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Everything in Free, plus</p>
          <ul className="space-y-3">
            {PRO_UPGRADES.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">No more limits</p>
          <ul className="space-y-2">
            {PRO_NO_LIMITS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <UpgradeButton className="mt-auto w-full bg-brand-600 hover:bg-brand-700 text-white border-0 justify-center font-semibold" />
      </div>
    </div>
  );
}

export function CostComparison() {
  return (
    <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
      {[
        { label: "IELTS exam fee",  value: "$200–250", sub: "one-time retake cost" },
        { label: "Human tutor",     value: "$30–80",   sub: "per hour of sessions" },
        { label: "IELTS Memo Pro",  value: "$12",      sub: "per month, cancel anytime", brand: true },
      ].map(({ label, value, sub, brand }) => (
        <div key={label} className={`rounded-xl border p-5 text-center ${brand ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"}`}>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${brand ? "text-brand-600" : "text-slate-800"}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
