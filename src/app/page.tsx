import Link from "next/link";
import { FeatureDemos } from "@/components/feature-demos";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Brain, Zap, BarChart3, Crosshair,
  Target, PenLine, ChevronRight, Infinity, Star,
  Clock, TrendingUp, ShieldCheck, Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ── Hero ── */}
        <section className="grid lg:grid-cols-2 gap-16 items-center py-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-4 py-1.5 text-xs font-medium text-slate-600 mb-7 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Adaptive feedback that remembers your mistakes
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
              Finally understand why your{" "}
              <span className="text-brand-600">IELTS score is stuck</span>
            </h1>

            <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-lg">
              IELTS Loop analyses your writing like an expert examiner, then
              builds a personal memory of your recurring mistakes — so every
              practice session targets exactly what&apos;s holding your band score back.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/auth/signin">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg h-10 px-5 font-medium text-sm w-full sm:w-auto">
                  Start for free <ChevronRight className="h-4 w-4 ml-1" />
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
                "Task 1 & Task 2 supported",
                "Results in under 60 seconds",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* App mockup */}
          <div className="hidden lg:block">
            <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.07)] overflow-hidden">
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
              <div className="p-4 border-b border-[var(--border)]">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Writing Memory</div>
                {[
                  { name: "Article errors",       cat: "GRA", freq: 7, w: 100, bar: "bg-red-400" },
                  { name: "Weak conclusions",      cat: "TA",  freq: 4, w: 60,  bar: "bg-emerald-400" },
                  { name: "Vocabulary repetition", cat: "LR",  freq: 3, w: 44,  bar: "bg-amber-400" },
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
              <div className="px-4 py-3 bg-brand-50 border-t border-[var(--border)] flex items-start gap-2.5">
                <Brain className="h-3.5 w-3.5 text-brand-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">AI Coaching: </span>
                  Article errors in 7 of 9 essays — your <span className="text-brand-600 font-semibold">#1 band limiter.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section>
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border)]">
              {[
                { value: "10,000+", label: "Essays Analysed",        icon: PenLine },
                { value: "+0.8",    label: "Avg Band Improvement",   icon: TrendingUp },
                { value: "< 60s",   label: "Feedback Time",          icon: Clock },
                { value: "4",       label: "Criteria Tracked",       icon: ShieldCheck },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 px-6 py-5">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">How it works</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Submit an essay, get examiner-level feedback in seconds, and watch your error profile sharpen over time.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: PenLine,   step: "01", title: "Submit Essay",      desc: "Paste your Task 1 or Task 2 response with the question prompt. Upload an image for Task 1 charts.",    color: "text-brand-600 bg-brand-50" },
              { icon: Target,    step: "02", title: "AI Examination",    desc: "Scored on all 4 official IELTS criteria by an AI model trained on examiner-level assessment.",   color: "text-blue-600 bg-blue-50" },
              { icon: Brain,     step: "03", title: "Memory Updates",    desc: "Each submission updates your personal error profile, separating one-off mistakes from real patterns.", color: "text-violet-600 bg-violet-50" },
              { icon: Crosshair, step: "04", title: "Targeted Practice", desc: "AI-generated exercises target your specific weaknesses — not generic drills anyone could find online.", color: "text-emerald-600 bg-emerald-50" },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <div key={step} className="relative bg-white border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                {i < 3 && <div className="hidden lg:block absolute top-8 -right-1.5 w-3 h-px bg-slate-200 z-10" />}
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

        {/* ── Feature Demos ── */}
        <FeatureDemos />

        {/* ── Why IELTS Loop ── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Advantage</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Why IELTS Loop works better</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Most preparation tools treat every student the same. We don't.</p>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
              {[
                {
                  icon: Users,
                  title: "vs Human Tutors",
                  points: [
                    { pro: true,  text: "Available 24 / 7" },
                    { pro: true,  text: "Consistent IELTS-standard scoring" },
                    { pro: true,  text: "Fraction of the cost" },
                    { pro: false, text: "Can't replace conversational practice" },
                  ],
                },
                {
                  icon: Zap,
                  title: "vs Generic AI",
                  points: [
                    { pro: true,  text: "Remembers your past mistakes" },
                    { pro: true,  text: "IELTS-specific criteria & scoring" },
                    { pro: true,  text: "Inline annotated error highlights" },
                    { pro: false, text: "Requires an internet connection" },
                  ],
                },
                {
                  icon: Brain,
                  title: "vs Textbooks",
                  points: [
                    { pro: true,  text: "Feedback on YOUR writing, not examples" },
                    { pro: true,  text: "Error profile grows with every essay" },
                    { pro: true,  text: "Exercises matched to your weak points" },
                    { pro: false, text: "Doesn't replace reading widely" },
                  ],
                },
              ].map(({ icon: Icon, title, points }) => (
                <div key={title} className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{title}</span>
                  </div>
                  <ul className="space-y-2">
                    {points.map(({ pro, text }) => (
                      <li key={text} className="flex items-start gap-2">
                        <span className={`mt-0.5 text-xs font-bold shrink-0 ${pro ? "text-emerald-500" : "text-slate-300"}`}>
                          {pro ? "✓" : "–"}
                        </span>
                        <span className={`text-xs leading-relaxed ${pro ? "text-slate-600" : "text-slate-400"}`}>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4 IELTS Pillars ── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Coverage</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">All 4 IELTS scoring criteria</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Every essay is evaluated on all four official criteria — and your memory profile tracks progress on each individually.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { code: "GRA", title: "Grammar Accuracy",    items: ["Articles (a/an/the)", "Tense consistency", "Subject-verb agreement", "Sentence structure"],  icon: "text-red-500 bg-red-50" },
              { code: "LR",  title: "Lexical Resource",     items: ["Vocabulary range", "Word choice precision", "Collocations", "Avoiding repetition"],           icon: "text-amber-500 bg-amber-50" },
              { code: "CC",  title: "Coherence & Cohesion", items: ["Paragraph flow", "Linking devices", "Idea progression", "Referencing"],                       icon: "text-blue-500 bg-blue-50" },
              { code: "TA",  title: "Task Achievement",     items: ["Addressing all parts", "Developing ideas", "Clarity of position", "Sufficient coverage"],     icon: "text-emerald-500 bg-emerald-50" },
            ].map(({ code, title, items, icon }) => (
              <div key={code} className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
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

        {/* ── Feedback Preview ── */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Feedback</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Examiner-quality feedback, instantly
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-3">
              Every analysis reads like a certified IELTS examiner wrote it — complete band scores across all four criteria, inline error annotations highlighted directly in your essay, and a prioritised list of score blockers.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Most importantly, when we&apos;ve seen you make the same mistake before, we call it out by name — because knowing it&apos;s a <em>pattern</em>, not a one-off, is your fastest path to fixing it.
            </p>
            <div className="space-y-2">
              {[
                "Inline error highlights with explanations",
                "Band score breakdown across all 4 criteria",
                "Top score blockers ranked by impact",
                "Memory insight when patterns are detected",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/auth/signin" className="inline-block mt-6">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg h-9 px-4 text-sm">
                Try it free <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

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
            <div className="px-5 py-4 bg-brand-50 border-t border-[var(--border)] flex items-start gap-2.5">
              <Brain className="h-3.5 w-3.5 text-brand-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Memory insight: </span>
                You&apos;ve made article errors in 7 of your last 9 essays — your{" "}
                <span className="text-brand-600 font-semibold">#1 band limiter.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="text-2xl font-bold text-slate-900">What test-takers say</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "Sara M.",
                role: "Improved 6.0 → 7.5",
                quote: "I submitted the same types of essays for months and never understood why my score plateaued. After two weeks on IELTS Loop, I could see exactly which mistake was appearing in every single essay. That clarity changed everything.",
                stars: 5,
              },
              {
                name: "Ahmed K.",
                role: "University applicant",
                quote: "The memory system is unlike anything I've used. It's not just feedback — it tracks your habits. When I saw 'article errors in 6 of 7 essays', I finally understood what my tutor had been trying to tell me for months.",
                stars: 5,
              },
              {
                name: "Priya L.",
                role: "Nurse registration exam",
                quote: "I needed Band 7 overall and 7 in Writing specifically. The targeted exercises felt like they were built just for me — because they were. Scored 7.5 in Writing on my next attempt.",
                stars: 5,
              },
            ].map(({ name, role, quote, stars }) => (
              <div key={name} className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-2xl font-bold text-slate-900">Common questions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                q: "How accurate is the AI scoring?",
                a: "Our model is calibrated against the official IELTS band descriptors across all four criteria. It consistently scores within ±0.5 of certified examiners, which is within the margin of variation between human examiners themselves.",
              },
              {
                q: "Does it work for both Academic and General Training?",
                a: "Yes. We support Academic Task 1 (graphs/charts — including image upload), General Training Task 1 (letters), and Task 2 essays for both modules.",
              },
              {
                q: "How many essays do I need before patterns appear?",
                a: "The memory system starts flagging recurring patterns after as few as 2–3 essays. By your 5th essay you'll have a clear picture of your top 3–5 score blockers.",
              },
              {
                q: "Is IELTS Loop free to use?",
                a: "You can sign up and submit essays for free. We believe every IELTS candidate deserves access to quality feedback regardless of budget.",
              },
              {
                q: "Will this replace a human tutor?",
                a: "For written feedback and pattern analysis, IELTS Loop goes further than most tutors — tracking error history across every submission. It won't replace spoken English practice, but for Writing specifically it's exceptionally thorough.",
              },
              {
                q: "How long does feedback take?",
                a: "Most essays are fully analysed in under 60 seconds. Complex long-form Task 2 responses may take up to 90 seconds.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Start free. Upgrade when you&apos;re serious. Cancel anytime.
            </p>
          </div>

          {/* Comparison table */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden mb-6">
            {/* Header row */}
            <div className="grid grid-cols-4 border-b border-[var(--border)]">
              <div className="col-span-2 px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide" />
              <div className="px-4 py-4 text-center border-l border-[var(--border)]">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Free</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">$0</p>
              </div>
              <div className="px-4 py-4 text-center border-l border-[var(--border)] bg-brand-50">
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Pro</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">$12<span className="text-xs font-normal text-slate-400">/mo</span></p>
              </div>
            </div>

            {[
              { label: "Essays per month",          free: "2",          pro: "Unlimited"     },
              { label: "Daily essay limit",          free: "2",          pro: "5 per day"     },
              { label: "AI examiner feedback",       free: true,         pro: true            },
              { label: "All 4 IELTS criteria scored",free: true,         pro: true            },
              { label: "Error pattern memory",       free: true,         pro: true            },
              { label: "Adaptive exercises",         free: true,         pro: true            },
              { label: "Progress analytics",         free: "Basic",      pro: "Full"          },
              { label: "Priority AI processing",     free: false,        pro: true            },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-4 border-b border-[var(--border)] last:border-0 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                <div className="col-span-2 px-6 py-3.5 text-sm text-slate-600">{row.label}</div>
                <div className="px-4 py-3.5 text-center border-l border-[var(--border)] flex items-center justify-center">
                  {row.free === true  ? <CheckCircle className="h-4 w-4 text-emerald-500" /> :
                   row.free === false ? <span className="text-slate-200 font-bold text-lg">—</span> :
                   <span className="text-sm text-slate-500">{row.free}</span>}
                </div>
                <div className="px-4 py-3.5 text-center border-l border-[var(--border)] bg-brand-50 flex items-center justify-center">
                  {row.pro === true  ? <CheckCircle className="h-4 w-4 text-brand-600" /> :
                   row.pro === false ? <span className="text-slate-200 font-bold text-lg">—</span> :
                   <span className="text-sm font-medium text-brand-700">{row.pro}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Value context */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "IELTS exam fee",     value: "$200–250",  sub: "one time"           },
              { label: "Human tutor",        value: "$30–80",    sub: "per hour"           },
              { label: "IELTS Loop Pro",     value: "$12",       sub: "per month", brand: true },
            ].map(({ label, value, sub, brand }) => (
              <div key={label} className={`rounded-xl border p-5 text-center ${brand ? "border-brand-200 bg-brand-50" : "border-[var(--border)] bg-white"}`}>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${brand ? "text-brand-600" : "text-slate-800"}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/auth/signin">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg h-10 px-6 text-sm border-0">
                Start free — no card needed <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <p className="text-slate-400 text-xs mt-3">Free forever · Upgrade anytime · Cancel in one click</p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-4">
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Ready to break through your band score plateau?
            </h2>
            <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
              Sign up free and submit your first essay in minutes. No credit card, no commitment — just clear, actionable feedback.
            </p>
            <Link href="/auth/signin">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg h-10 px-6 text-sm border-0">
                Get started free <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <p className="text-slate-400 text-xs mt-4">
              Join thousands of IELTS candidates already improving with IELTS Loop
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
