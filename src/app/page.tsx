import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Brain, Zap, BarChart3, Crosshair, BookMarked, Target, TrendingUp, PenLine, ChevronRight } from "lucide-react";

export default async function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-brand-950 to-brand-900 text-white min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full opacity-5 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-sm font-medium text-brand-200 mb-8">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Powered by Claude AI · Mistake Intelligence Engine
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                Finally understand why your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-200">
                  IELTS score is stuck
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-brand-200 leading-relaxed mb-10 max-w-2xl">
                IELTS Loop builds a memory of your mistakes across every essay —
                then targets exactly what&apos;s holding your band score back.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white font-semibold w-full sm:w-auto rounded-xl shadow-2xl shadow-brand-500/30 border-0 transition-all duration-300"
                  >
                    Start for free
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 w-full sm:w-auto rounded-xl transition-all duration-300"
                  >
                    See how it works
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-300">
                {[
                  "10,000+ essays analysed",
                  "Average +0.8 band improvement",
                  "4 scoring pillars tracked",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero mockup card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600/80 to-brand-800/80 backdrop-blur-sm p-5 flex items-center justify-between border-b border-white/10">
                  <div>
                    <p className="text-brand-200 text-xs font-medium uppercase tracking-wide mb-0.5">
                      Overall Band Score
                    </p>
                    <p className="text-white text-4xl font-extrabold">6.5</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Task 2 · Academic
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Task Achievement", code: "TA", score: 6.5, color: "bg-emerald-500" },
                    { label: "Coherence & Cohesion", code: "CC", score: 6.0, color: "bg-blue-500" },
                    { label: "Lexical Resource", code: "LR", score: 6.5, color: "bg-amber-500" },
                    { label: "Grammar Accuracy", code: "GRA", score: 6.0, color: "bg-red-500" },
                  ].map(({ label, code, score, color }) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white/60 w-8 shrink-0">{code}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${(score / 9) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white w-8 text-right shrink-0">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <div className="bg-brand-500/20 border border-brand-400/30 rounded-xl p-3 flex gap-2.5">
                    <Brain className="h-4 w-4 text-brand-300 mt-0.5 shrink-0" />
                    <p className="text-sm text-brand-200 leading-relaxed">
                      <span className="font-semibold text-white">Memory insight:</span> Article errors found in 7 of your last 9 essays — your{" "}
                      <span className="font-semibold text-white">#1 band limiter.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Detect. Analyse. Remember. Improve.
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              How it works
            </h2>
          </div>

          {/* Steps */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: PenLine,
                step: "01",
                title: "Submit Your Essay",
                desc: "Paste your Task 1 or Task 2 response and the question prompt.",
                gradient: "from-brand-600 to-brand-700",
              },
              {
                icon: Target,
                step: "02",
                title: "AI Examiner Analysis",
                desc: "Scored on all 4 official IELTS criteria with annotated feedback.",
                gradient: "from-brand-500 to-brand-600",
              },
              {
                icon: Brain,
                step: "03",
                title: "Memory System Updates",
                desc: "Your error profile grows with every submission, identifying true patterns.",
                gradient: "from-violet-500 to-violet-600",
              },
              {
                icon: Crosshair,
                step: "04",
                title: "Targeted Practice",
                desc: "Exercises built from YOUR specific weaknesses — not generic drills.",
                gradient: "from-blue-500 to-blue-600",
              },
            ].map(({ icon: Icon, step, title, desc, gradient }) => (
              <div key={step} className="relative">
                {/* Connector line */}
                <div className="hidden lg:block absolute top-7 left-full w-8 h-px bg-brand-200 z-10" />
                <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl shadow-brand-100/30 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-brand-400 tracking-widest">
                      STEP {step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The 4 Pillars ── */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-brand-50/30 to-brand-50/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The 4 IELTS scoring pillars
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Every essay is evaluated on all four official criteria — and your
              memory profile tracks your progress on each one.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                label: "GRA",
                borderColor: "border-l-red-500",
                iconGradient: "from-red-500 to-red-600",
                textColor: "text-red-500",
                title: "Grammar Accuracy",
                items: [
                  "Articles (a/an/the)",
                  "Tense consistency",
                  "Subject-verb agreement",
                  "Sentence structure",
                ],
                dotColor: "bg-red-500",
              },
              {
                label: "LR",
                borderColor: "border-l-amber-500",
                iconGradient: "from-amber-500 to-amber-600",
                textColor: "text-amber-500",
                title: "Lexical Resource",
                items: [
                  "Vocabulary range",
                  "Word choice precision",
                  "Collocations",
                  "Avoiding repetition",
                ],
                dotColor: "bg-amber-500",
              },
              {
                label: "CC",
                borderColor: "border-l-blue-500",
                iconGradient: "from-blue-500 to-blue-600",
                textColor: "text-blue-500",
                title: "Coherence & Cohesion",
                items: [
                  "Paragraph flow",
                  "Linking devices",
                  "Idea progression",
                  "Referencing",
                ],
                dotColor: "bg-blue-500",
              },
              {
                label: "TA",
                borderColor: "border-l-emerald-500",
                iconGradient: "from-emerald-500 to-emerald-600",
                textColor: "text-emerald-500",
                title: "Task Achievement",
                items: [
                  "Addressing all parts",
                  "Developing ideas",
                  "Clarity of position",
                  "Sufficient coverage",
                ],
                dotColor: "bg-emerald-500",
              },
            ].map(({ label, borderColor, iconGradient, textColor, title, items, dotColor }) => (
              <Card
                key={label}
                variant="default"
                className={`border-l-4 ${borderColor} hover:shadow-2xl transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-md shrink-0`}
                    >
                      <BookMarked className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${textColor}`}
                      >
                        {label}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {title}
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Writing Memory System ── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-brand-950 to-brand-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-brand-300 mb-6 border border-brand-500/30">
              <Brain className="h-3.5 w-3.5" />
              Powered by Memory AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Memory System.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-brand-300">
                Your secret weapon.
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Most writing tools forget you the moment you close the tab. We
              don&apos;t.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Tracks Every Mistake",
                desc: "We log every error type, how often it appears, and when you last made it — building a precise picture of your writing habits.",
                accent: "border-brand-500/40",
                gradient: "from-brand-500 to-brand-600",
              },
              {
                icon: Brain,
                title: "Finds Your Patterns",
                desc: "After 3+ essays, we identify your #1 score blocker versus random one-off errors, so you know exactly where to focus.",
                accent: "border-brand-500/40",
                gradient: "from-brand-600 to-brand-700",
              },
              {
                icon: Crosshair,
                title: "Adapts Your Practice",
                desc: "Exercises are generated from your real mistake profile, not generic drills — because your time is too valuable for irrelevant practice.",
                accent: "border-blue-500/40",
                gradient: "from-blue-500 to-blue-600",
              },
            ].map(({ icon: Icon, title, desc, accent, gradient }) => (
              <div
                key={title}
                className={`bg-white/10 backdrop-blur-xl border ${accent} rounded-2xl p-8 hover:bg-white/15 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Examiner Feedback Preview ── */}
      <section className="py-24 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
                Examiner-style feedback
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                See exactly what&apos;s holding you back
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Every essay analysis reads like a certified IELTS examiner wrote
                it — with band scores, criterion breakdown, and a prioritised
                list of your top score blockers.
              </p>
              <p className="text-slate-500 leading-relaxed text-sm">
                Most importantly, when we&apos;ve seen you make the same mistake
                before, we call it out — because knowing a pattern is your
                fastest path to fixing it.
              </p>
            </div>

            {/* Mock Feedback Card */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-2xl rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-5 flex items-center justify-between">
                <div>
                  <p className="text-brand-200 text-xs font-medium uppercase tracking-wide mb-0.5">
                    Overall Band Score
                  </p>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-100 text-4xl font-extrabold">6.5</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Task 2 · Academic
                  </span>
                </div>
              </div>

              {/* Criterion scores */}
              <div className="p-5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Criterion Breakdown
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "Task Achievement", code: "TA", score: 6.5, color: "bg-emerald-500" },
                    { label: "Coherence & Cohesion", code: "CC", score: 6.0, color: "bg-blue-500" },
                    { label: "Lexical Resource", code: "LR", score: 6.5, color: "bg-amber-500" },
                    { label: "Grammar Accuracy", code: "GRA", score: 6.0, color: "bg-red-500" },
                  ].map(({ label, code, score, color }) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-8 shrink-0">
                        {code}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${(score / 9) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700 w-8 text-right shrink-0">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Score Blockers */}
              <div className="p-5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Top Score Blockers
                </p>
                <div className="space-y-2">
                  {[
                    { name: "Article errors", impact: "High Impact", color: "bg-red-100 text-red-700" },
                    { name: "Weak conclusions", impact: "High Impact", color: "bg-red-100 text-red-700" },
                    { name: "Vocabulary repetition", impact: "Medium", color: "bg-amber-100 text-amber-700" },
                  ].map(({ name, impact, color }) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory insight */}
              <div className="p-5 bg-brand-50/80">
                <div className="flex gap-3">
                  <Brain className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-brand-800 leading-relaxed">
                    <span className="font-semibold">Memory insight:</span> You&apos;ve
                    made article errors in 7 of your last 9 essays. This is your{" "}
                    <span className="font-semibold">#1 band limiter.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-brand-950 to-brand-900 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-2xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-brand-800/10 rounded-2xl" />
            <div className="absolute -inset-px bg-gradient-to-br from-brand-500/20 via-transparent to-brand-700/20 rounded-2xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to break through your band score plateau?
              </h2>
              <p className="text-brand-200 text-lg mb-8">
                No credit card. No fluff. Just targeted improvement.
              </p>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white font-bold text-base px-8 rounded-xl shadow-2xl shadow-brand-500/30 border-0 transition-all duration-300"
                >
                  Get started free
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <p className="text-brand-300 text-sm mt-4">
                Join thousands of IELTS candidates already improving with IELTS Loop
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
