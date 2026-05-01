import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Brain, Zap, BarChart3, Crosshair,
  Target, PenLine, ChevronRight, Infinity,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* ── Hero ── */}
        <section className="grid lg:grid-cols-2 gap-16 items-center py-8">

          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-4 py-1.5 text-xs font-medium text-slate-600 mb-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Powered by Claude AI · Mistake Intelligence Engine
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
              Finally understand why your{" "}
              <span className="text-brand-600">IELTS score is stuck</span>
            </h1>

            <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-lg">
              IELTS Loop builds a memory of your mistakes across every essay —
              then targets exactly what&apos;s holding your band score back.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/auth/signin">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg h-10 px-5 font-medium text-sm w-full sm:w-auto">
                  Start for free
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" className="rounded-lg h-10 px-5 text-sm w-full sm:w-auto border-[var(--border)] text-slate-600 hover:bg-white">
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                "No credit card required",
                "4 scoring criteria tracked",
                "Personalised exercises",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: app mockup */}
          <div className="hidden lg:block">
            <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.07)] overflow-hidden">
              {/* Mock nav */}
              <div className="border-b border-[var(--border)] px-4 h-10 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-sm bg-brand-600 flex items-center justify-center">
                    <Infinity className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">IELTSLoop</span>
                </div>
                <div className="flex gap-1 ml-1">
                  {["Dashboard", "Submit", "Exercises", "Progress"].map((l) => (
                    <span key={l} className={`text-[11px] px-2 py-1 rounded-md ${l === "Dashboard" ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-400"}`}>{l}</span>
                  ))}
                </div>
              </div>
              {/* Score row */}
              <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
                <div className="text-center shrink-0">
                  <div className="text-3xl font-bold text-amber-500 tabular-nums">6.5</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Overall</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[
                    { code: "TA",  score: 6.5, bar: "bg-emerald-400" },
                    { code: "CC",  score: 6.0, bar: "bg-blue-400" },
                    { code: "LR",  score: 6.5, bar: "bg-amber-400" },
                    { code: "GRA", score: 6.0, bar: "bg-red-400" },
                  ].map(({ code, score, bar }) => (
                    <div key={code} className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 w-7 shrink-0">{code}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`${bar} h-full rounded-full`} style={{ width: `${(score / 9) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 w-7 text-right tabular-nums">{score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Error memory */}
              <div className="p-4 border-b border-[var(--border)]">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Writing Memory</div>
                {[
                  { name: "Article errors",         cat: "GRA", freq: 7, w: 100, bar: "bg-red-400" },
                  { name: "Weak conclusions",        cat: "TA",  freq: 4, w: 60,  bar: "bg-emerald-400" },
                  { name: "Vocabulary repetition",   cat: "LR",  freq: 3, w: 44,  bar: "bg-amber-400" },
                ].map(({ name, cat, freq, w, bar }) => (
                  <div key={name} className="flex items-center gap-2 py-1.5 border-b border-[var(--border)] last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-medium text-slate-700 truncate">{name}</span>
                        <span className="text-[9px] font-semibold px-1 py-px rounded bg-slate-100 text-slate-500">{cat}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-1 rounded-full ${bar}`} style={{ width: `${w}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 tabular-nums shrink-0">×{freq}</span>
                  </div>
                ))}
              </div>
              {/* Coaching row */}
              <div className="bg-slate-900 p-4 flex items-start gap-2.5">
                <Brain className="h-3.5 w-3.5 text-brand-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-semibold text-white">AI Coaching: </span>
                  Article errors in 7 of 9 essays — your <span className="text-brand-400 font-semibold">#1 band limiter.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: PenLine,   step: "01", title: "Submit Essay",      desc: "Paste your Task 1 or Task 2 response with the question prompt.",         color: "text-brand-600 bg-brand-50" },
              { icon: Target,    step: "02", title: "AI Examination",    desc: "Scored on all 4 official IELTS criteria with annotated inline feedback.", color: "text-blue-600 bg-blue-50" },
              { icon: Brain,     step: "03", title: "Memory Updates",    desc: "Your error profile grows with every essay, surfacing real patterns.",      color: "text-violet-600 bg-violet-50" },
              { icon: Crosshair, step: "04", title: "Targeted Practice", desc: "Exercises built from YOUR specific weaknesses — not generic drills.",      color: "text-emerald-600 bg-emerald-50" },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <div key={step} className="relative bg-white border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 -right-1.5 w-3 h-px bg-slate-200 z-10" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold text-slate-300 tracking-widest mb-1">STEP {step}</div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4 IELTS Pillars ── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Coverage</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">All 4 IELTS scoring criteria</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Every essay is evaluated on all four official criteria — and your memory profile tracks progress on each one individually.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { code: "GRA", title: "Grammar Accuracy",      items: ["Articles (a/an/the)", "Tense consistency", "Subject-verb agreement", "Sentence structure"], top: "border-t-red-400",     icon: "text-red-500 bg-red-50" },
              { code: "LR",  title: "Lexical Resource",       items: ["Vocabulary range", "Word choice precision", "Collocations", "Avoiding repetition"],          top: "border-t-amber-400",  icon: "text-amber-500 bg-amber-50" },
              { code: "CC",  title: "Coherence & Cohesion",   items: ["Paragraph flow", "Linking devices", "Idea progression", "Referencing"],                      top: "border-t-blue-400",   icon: "text-blue-500 bg-blue-50" },
              { code: "TA",  title: "Task Achievement",        items: ["Addressing all parts", "Developing ideas", "Clarity of position", "Sufficient coverage"],    top: "border-t-emerald-400",icon: "text-emerald-500 bg-emerald-50" },
            ].map(({ code, title, items, top, icon }) => (
              <div key={code} className={`bg-white border border-[var(--border)] border-t-2 ${top} rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 text-xs font-bold ${icon}`}>{code}</div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Memory System ── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Memory AI</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">The system that remembers your mistakes</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              Most writing tools forget you the moment you close the tab. IELTS Loop doesn&apos;t.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: BarChart3, title: "Tracks Every Mistake",   desc: "Every error type is logged — how often it appears and when you last made it — building a precise picture of your writing habits." },
              { icon: Brain,     title: "Finds Your Patterns",    desc: "After a few essays we separate your #1 score blocker from random one-off errors — so you know exactly where to focus first." },
              { icon: Crosshair, title: "Adapts Your Practice",   desc: "Exercises are generated from your real mistake profile, not generic drills — because your time is too valuable for irrelevant practice." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-brand-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feedback Preview ── */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Feedback</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              See exactly what&apos;s holding you back
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-3">
              Every analysis reads like a certified IELTS examiner wrote it — with band scores, criterion breakdown, and your top score blockers highlighted inline in your essay.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              When we&apos;ve seen you make the same mistake before, we call it out — because knowing it&apos;s a pattern is your fastest path to fixing it.
            </p>
            <Link href="/auth/signin" className="inline-block mt-6">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg h-9 px-4 text-sm">
                Try it free <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mock feedback card */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-4">
              <div className="shrink-0">
                <div className="text-3xl font-bold text-amber-500 tabular-nums">6.5</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Overall Band</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { code: "TA",  score: 6.5, bar: "bg-emerald-400" },
                  { code: "CC",  score: 6.0, bar: "bg-blue-400" },
                  { code: "LR",  score: 6.5, bar: "bg-amber-400" },
                  { code: "GRA", score: 6.0, bar: "bg-red-400" },
                ].map(({ code, score, bar }) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 w-7 shrink-0">{code}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`${bar} h-full rounded-full`} style={{ width: `${(score / 9) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 w-7 text-right tabular-nums">{score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500 shrink-0">Task 2</span>
            </div>
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Score Blockers</div>
              {[
                { name: "Article errors",        badge: "High",   color: "bg-red-50 text-red-600" },
                { name: "Weak conclusions",      badge: "High",   color: "bg-red-50 text-red-600" },
                { name: "Vocabulary repetition", badge: "Medium", color: "bg-amber-50 text-amber-600" },
              ].map(({ name, badge, color }) => (
                <div key={name} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-slate-700">{name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-px rounded ${color}`}>{badge}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 px-5 py-4 flex items-start gap-2.5">
              <Brain className="h-3.5 w-3.5 text-brand-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-white">Memory insight: </span>
                You&apos;ve made article errors in 7 of your last 9 essays — your{" "}
                <span className="text-brand-400 font-semibold">#1 band limiter.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-8">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to break through your band score plateau?
            </h2>
            <p className="text-slate-400 text-sm mb-8">No credit card. No fluff. Just targeted improvement.</p>
            <Link href="/auth/signin">
              <Button className="bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg h-10 px-6 text-sm border-0">
                Get started free <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <p className="text-slate-500 text-xs mt-4">
              Join thousands of IELTS candidates already improving with IELTS Loop
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
