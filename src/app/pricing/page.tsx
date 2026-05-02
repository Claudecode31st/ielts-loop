import Link from "next/link";
import { Check, X, Zap, Brain, BarChart3, PenLine } from "lucide-react";
import { UpgradeButton } from "@/components/upgrade-button";

const FREE_LIMITS = [
  "2 essays per month",
  "2 essays per day",
  "5 guided writing sessions per day",
  "Basic progress view only",
  "No band score trend charts",
  "No full essay history",
];

const PRO_FEATURES = [
  { icon: PenLine,   label: "Unlimited essays",              sub: "up to 5 per day, every month" },
  { icon: Zap,       label: "50 guided writing sessions/day", sub: "live AI coaching as you write" },
  { icon: Brain,     label: "Full AI error memory",           sub: "patterns tracked across all essays" },
  { icon: BarChart3, label: "Complete progress analytics",    sub: "band charts, trends, full history" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Pricing</p>
          <h1 className="text-4xl font-bold text-slate-900">Start free. Upgrade when you&apos;re serious.</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Every plan includes AI feedback, error memory, and targeted exercises.
            Pro removes the limits — so nothing slows your preparation down.
          </p>
        </div>

        {/* Main cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">

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

            {/* What's included */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What&apos;s included</p>
              <ul className="space-y-2.5">
                {[
                  "AI examiner feedback on every essay",
                  "All 4 IELTS criteria scored",
                  "AI error memory & score blocker tracking",
                  "Targeted practice exercises",
                  "Task 1 & Task 2 (images supported)",
                  "5 guided writing sessions per day",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Limits */}
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

            {/* Pro upgrades */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Everything in Free, plus</p>
              <ul className="space-y-3">
                {PRO_FEATURES.map(({ icon: Icon, label, sub }) => (
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

            {/* No limits list */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">No more limits</p>
              <ul className="space-y-2">
                {[
                  "Unlimited essays per month",
                  "5 essays per day",
                  "50 guided writing sessions/day",
                  "Full band score progress charts",
                  "Complete essay history & trends",
                  "Per-criterion improvement tracking",
                ].map((f) => (
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

        {/* Full comparison table */}
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-base font-bold text-slate-800 mb-4 text-center">Full feature comparison</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

            {[
              {
                section: "Writing & Feedback",
                rows: [
                  { label: "AI examiner feedback",             free: true,        pro: true },
                  { label: "All 4 IELTS criteria scored",      free: true,        pro: true },
                  { label: "Task 1 & Task 2 supported",        free: true,        pro: true },
                  { label: "Task 1 image / chart upload",      free: true,        pro: true },
                  { label: "Essays per month",                 free: "2",         pro: "Unlimited" },
                  { label: "Daily essay limit",                free: "2/day",     pro: "5/day" },
                  { label: "Guided writing (live coaching)",   free: "5/day",     pro: "50/day" },
                ],
              },
              {
                section: "Memory & Practice",
                rows: [
                  { label: "AI error memory",                  free: true,        pro: true },
                  { label: "Score blocker tracking",           free: true,        pro: true },
                  { label: "Examples from your own writing",   free: true,        pro: true },
                  { label: "Targeted practice exercises",      free: true,        pro: true },
                ],
              },
              {
                section: "Progress & Analytics",
                rows: [
                  { label: "Band score progress charts",       free: false,       pro: true },
                  { label: "Full essay history",               free: false,       pro: true },
                  { label: "Per-criterion trend tracking",     free: false,       pro: true },
                  { label: "Priority AI processing",           free: false,       pro: true },
                ],
              },
            ].map(({ section, rows }) => (
              <div key={section}>
                {/* Section header */}
                <div className="grid grid-cols-[1fr_100px_120px] bg-slate-50 border-b border-slate-100">
                  <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section}</div>
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-l border-slate-100">Free</div>
                  <div className="px-3 py-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest text-center border-l border-slate-100 bg-brand-50/60">Pro</div>
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_120px] border-b border-slate-100 last:border-b-0">
                    <div className="px-5 py-3 text-sm text-slate-600">{row.label}</div>
                    <div className="px-3 py-3 border-l border-slate-100 flex items-center justify-center">
                      {row.free === true  ? <Check className="h-4 w-4 text-emerald-500" /> :
                       row.free === false ? <span className="text-slate-200 font-bold">—</span> :
                       <span className="text-xs text-slate-500 font-medium">{row.free}</span>}
                    </div>
                    <div className="px-3 py-3 border-l border-slate-100 bg-brand-50/40 flex items-center justify-center">
                      {row.pro === true  ? <Check className="h-4 w-4 text-brand-600" /> :
                       row.pro === false ? <span className="text-slate-200 font-bold">—</span> :
                       <span className="text-xs text-brand-700 font-semibold">{row.pro}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Cost comparison */}
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-base font-bold text-slate-800 mb-4 text-center">How it compares</h2>
          <div className="grid sm:grid-cols-3 gap-4">
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
        </div>

        <p className="text-center text-xs text-slate-400">
          Cancel anytime. Billed monthly. Prices in USD. 7-day money-back guarantee on Pro.
        </p>

      </div>
    </div>
  );
}
