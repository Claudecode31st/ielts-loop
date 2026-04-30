import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  TrendingUp,
  Target,
  CheckCircle,
  BookOpen,
  Zap,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-200 mb-6 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              Powered by Claude AI — the most advanced writing model
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Finally understand why your{" "}
              <span className="text-indigo-300">IELTS score</span> is stuck
            </h1>
            <p className="text-lg sm:text-xl text-indigo-200 leading-relaxed mb-8 max-w-2xl">
              Our AI examiner gives you the same rigorous band scores as a
              certified IELTS examiner — and remembers your past mistakes to
              give you truly personalized feedback every time you submit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold w-full sm:w-auto">
                  Start for Free →
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  See How It Works
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-indigo-300">
              {["Real IELTS band scores", "Instant feedback", "Free to start"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="bg-indigo-950 text-indigo-300 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          Helping IELTS candidates worldwide prepare for bands 6.0 – 8.0+
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The coaching system that learns from you
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Unlike generic writing tools, IELTS Loop builds a profile of your
              specific errors and tracks your improvement over time.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100">
                  <BookOpen className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Real IELTS Examiner AI
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Scored using official band descriptors across all 4 criteria:
                  Task Achievement, Coherence & Cohesion, Lexical Resource, and
                  Grammatical Range & Accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow ring-2 ring-indigo-500">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Memory System
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  The AI remembers every mistake you&apos;ve ever made. When you
                  repeat an error, it calls it out explicitly — because that&apos;s
                  what actually changes behavior.
                </p>
                <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular Feature
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100">
                  <Target className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Adaptive Practice
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Exercises generated specifically for your weaknesses — not
                  generic grammar drills. Focus your study time on what will
                  actually move your score.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Submit your essay",
                desc: "Paste your Task 1 or Task 2 essay along with the question prompt.",
                icon: PenLine,
              },
              {
                step: "02",
                title: "Get scored instantly",
                desc: "Receive band scores for all 4 criteria plus detailed error annotations within seconds.",
                icon: CheckCircle,
              },
              {
                step: "03",
                title: "Track & improve",
                desc: "Your error patterns are remembered. Each new essay gives you more targeted feedback.",
                icon: TrendingUp,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {step}
                  </div>
                </div>
                <div>
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

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to raise your band score?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Submit your first essay free. No credit card required.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold">
              Get Started Free →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Import needs to be at top level
function PenLine({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="m15 5 3 3" />
    </svg>
  );
}
