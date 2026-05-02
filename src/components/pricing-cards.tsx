import Link from "next/link";
import { Check, X, Zap, Brain, BarChart3, PenLine, ArrowRight } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-3">

      {/* Main comparison */}
      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">

        {/* The old way */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">The traditional way</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">IELTS exam retake</p>
                <p className="text-[11px] text-slate-400">one failed attempt</p>
              </div>
              <span className="text-sm font-bold text-slate-800">$200–250</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Private tutor</p>
                <p className="text-[11px] text-slate-400">just 5 hours of sessions</p>
              </div>
              <span className="text-sm font-bold text-slate-800">$150–400</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">Typical total spend</p>
              <span className="text-base font-bold text-red-500">$350–650+</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-auto">
            …and you still prepare alone, with no feedback between sessions.
          </p>
        </div>

        {/* VS divider */}
        <div className="hidden sm:flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold text-slate-300 bg-[#F3F4F6] px-1">VS</span>
          <div className="w-px flex-1 bg-slate-200" />
        </div>

        {/* IELTS Memo Pro */}
        <div className="bg-brand-600 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-300">IELTS Memo Pro</p>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-white">$12</span>
              <span className="text-brand-300 text-sm">/month</span>
            </div>
            <p className="text-brand-300 text-xs mt-1">Cancel anytime. No contracts.</p>
          </div>
          <ul className="space-y-2 flex-1">
            {[
              "Unlimited AI examiner feedback",
              "Live writing coach as you type",
              "Error memory across all essays",
              "Band score progress charts",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-brand-100">
                <Check className="h-3.5 w-3.5 text-brand-300 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-brand-400 border-t border-brand-500 pt-3 mt-auto">
            That&apos;s less than one cup of coffee a week.
          </p>
        </div>
      </div>

      {/* Savings callout */}
      <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
        <div className="flex-1">
          <p className="text-sm font-bold text-emerald-800">
            Save up to <span className="text-emerald-600">$638</span> compared to retaking the exam with a tutor
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Use IELTS Memo for a full year and still spend less than one retake fee.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
      </div>

    </div>
  );
}
