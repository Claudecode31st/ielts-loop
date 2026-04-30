import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { essays, users, errorPatterns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenLine,
  TrendingUp,
  Target,
  BookOpen,
  Dumbbell,
  ArrowRight,
  Brain,
  Clock,
} from "lucide-react";
import { getBandColor, getBandBgColor, formatDate } from "@/lib/utils";

// Map errorCategory strings to IELTS pillar codes
function getCategoryLabel(cat: string): string {
  if (cat === "grammar") return "GRA";
  if (cat === "vocabulary") return "LR";
  if (cat === "structure") return "CC";
  return "TA";
}

function getCategoryColors(cat: string): { bg: string; text: string; bar: string } {
  if (cat === "grammar") return { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" };
  if (cat === "vocabulary") return { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500" };
  if (cat === "structure") return { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" };
  return { bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500" };
}

function getImpactLabel(freq: number): { label: string; bg: string; text: string } {
  if (freq >= 5) return { label: "High Impact", bg: "bg-red-100", text: "text-red-700" };
  if (freq >= 3) return { label: "Medium", bg: "bg-amber-100", text: "text-amber-700" };
  return { label: "Low", bg: "bg-slate-100", text: "text-slate-600" };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch user data
  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Fetch recent essays
  const recentEssays = await db
    .select()
    .from(essays)
    .where(eq(essays.userId, session.user.id))
    .orderBy(desc(essays.submittedAt))
    .limit(4);

  // Fetch top recurring errors
  const topErrors = await db
    .select()
    .from(errorPatterns)
    .where(eq(errorPatterns.userId, session.user.id))
    .orderBy(desc(errorPatterns.frequency))
    .limit(5);

  const firstName = session.user.name?.split(" ")[0] || "there";
  const currentBand = userData?.currentBand
    ? parseFloat(String(userData.currentBand))
    : null;
  const targetBand = userData?.targetBand
    ? parseFloat(String(userData.targetBand))
    : 7.0;
  const totalEssays = userData?.totalEssays || 0;

  const topError = topErrors[0];
  const bandColorClass = currentBand ? getBandColor(currentBand) : "text-slate-400";
  const gapToTarget =
    currentBand != null ? Math.max(0, targetBand - currentBand) : null;

  // Last 4 essay bands for the mini timeline
  const lastFourBands = recentEssays
    .slice(0, 4)
    .map((e) => (e.overallBand ? parseFloat(String(e.overallBand)) : null))
    .reverse();

  // Weekly focus areas based on top error categories
  const focusCategories = Array.from(
    new Set(topErrors.slice(0, 3).map((e) => e.errorCategory))
  );
  const focusAreaMap: Record<string, { name: string; minutes: number }> = {
    grammar: { name: "Grammar Accuracy", minutes: 20 },
    vocabulary: { name: "Lexical Resource", minutes: 15 },
    structure: { name: "Coherence & Cohesion", minutes: 15 },
    task: { name: "Task Achievement", minutes: 20 },
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Welcome Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Band Goal:{" "}
              <span className="font-semibold text-slate-700">
                {targetBand.toFixed(1)}
              </span>{" "}
              ·{" "}
              <span className="font-semibold text-slate-700">{totalEssays}</span>{" "}
              {totalEssays === 1 ? "essay" : "essays"} submitted
            </p>
          </div>
          <Link href="/essay/new">
            <Button
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shrink-0"
            >
              <PenLine className="h-5 w-5" />
              Submit New Essay →
            </Button>
          </Link>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Current Band */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-slate-100">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-400">current</span>
              </div>
              <div className={`text-3xl font-extrabold ${bandColorClass}`}>
                {currentBand != null ? currentBand.toFixed(1) : "–"}
              </div>
              <p className="text-xs text-slate-500 mt-1">Current Band</p>
            </CardContent>
          </Card>

          {/* Target Band */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <Target className="h-5 w-5 text-indigo-500" />
                </div>
                <span className="text-xs text-slate-400">goal</span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-600">
                {targetBand.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Target Band</p>
            </CardContent>
          </Card>

          {/* Essays Submitted */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-50">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-xs text-slate-400">total</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800">
                {totalEssays}
              </div>
              <p className="text-xs text-slate-500 mt-1">Essays Submitted</p>
            </CardContent>
          </Card>

          {/* Top Error */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-red-50">
                  <Brain className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-xs text-slate-400">#1</span>
              </div>
              <div className="text-base font-bold text-slate-800 leading-tight min-h-[36px] flex items-center">
                {topError ? topError.errorType : "None yet"}
              </div>
              <p className="text-xs text-slate-500 mt-1">Top Error</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Main 3-column grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── LEFT COLUMN (col-span-2) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Writing Memory — Error Profile */}
            <Card className="border-purple-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-purple-100 bg-purple-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-base font-bold text-purple-900">
                      Writing Memory — Your Error Profile
                    </CardTitle>
                  </div>
                  <Link
                    href="/progress"
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                  >
                    View full memory <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {topErrors.length === 0 ? (
                  <div className="py-10 text-center px-6">
                    <Brain className="h-10 w-10 text-purple-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      Submit your first essay to build your memory profile
                    </p>
                    <Link href="/essay/new" className="mt-3 inline-block">
                      <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                        Submit first essay →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {topErrors.map((error, idx) => {
                      const colors = getCategoryColors(error.errorCategory);
                      const maxFreq = topErrors[0].frequency ?? 1;
                      const freq = error.frequency ?? 0;
                      const barWidth = maxFreq > 0 ? Math.round((freq / maxFreq) * 100) : 0;
                      return (
                        <div key={error.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                          <span className="text-xs font-bold text-slate-400 w-4 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {error.errorType}
                            </p>
                            <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${colors.bar} transition-all`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                          <span
                            className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                          >
                            {getCategoryLabel(error.errorCategory)}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-slate-500 w-10 text-right">
                            ×{freq}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Essays */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Recent Essays
                  </CardTitle>
                  <Link
                    href="/essays"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentEssays.length === 0 ? (
                  <div className="py-12 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-700 font-medium mb-1">
                      No essays yet
                    </p>
                    <p className="text-slate-400 text-sm mb-4">
                      Submit your first essay and get your IELTS band score in
                      seconds.
                    </p>
                    <Link href="/essay/new">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Submit your first essay →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentEssays.map((essay) => {
                      const band = essay.overallBand
                        ? parseFloat(String(essay.overallBand))
                        : null;
                      return (
                        <Link key={essay.id} href={`/essay/${essay.id}`}>
                          <div className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="secondary"
                                  className="text-xs shrink-0"
                                >
                                  {essay.taskType === "task1"
                                    ? "Task 1"
                                    : "Task 2"}
                                </Badge>
                                <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(essay.submittedAt!)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 line-clamp-2 leading-snug">
                                {essay.prompt}
                              </p>
                            </div>
                            {band != null ? (
                              <div
                                className={`shrink-0 text-2xl font-extrabold ${getBandColor(band)}`}
                              >
                                {band.toFixed(1)}
                              </div>
                            ) : (
                              <div className="shrink-0 text-sm text-slate-400 font-medium">
                                —
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Score Blockers */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Top Score Blockers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {topErrors.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">
                    No data yet — submit essays to find your score blockers.
                  </p>
                ) : (
                  topErrors.slice(0, 3).map((error, idx) => {
                    const colors = getCategoryColors(error.errorCategory);
                    const impact = getImpactLabel(error.frequency ?? 0);
                    const impactDescriptions: Record<string, string> = {
                      grammar:
                        "Grammatical errors directly lower your GRA band score.",
                      vocabulary:
                        "Limited vocabulary range caps your LR band score.",
                      structure:
                        "Weak cohesion reduces your CC band score.",
                    };
                    const impactDesc =
                      impactDescriptions[error.errorCategory] ||
                      "This pattern is reducing your TA band score.";
                    return (
                      <div
                        key={error.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-sm font-semibold text-slate-800">
                              {error.errorType}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                            >
                              {getCategoryLabel(error.errorCategory)}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${impact.bg} ${impact.text}`}
                            >
                              {impact.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">
                            {impactDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (col-span-1) ── */}
          <div className="space-y-6">

            {/* Band Progress */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Band Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {/* Current band large number */}
                <div className="text-center mb-5">
                  <div
                    className={`text-6xl font-extrabold ${bandColorClass}`}
                  >
                    {currentBand != null ? currentBand.toFixed(1) : "–"}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentBand != null
                      ? gapToTarget != null && gapToTarget > 0
                        ? `${gapToTarget.toFixed(1)} to go to reach Band ${targetBand.toFixed(1)}`
                        : `Target Band ${targetBand.toFixed(1)} reached!`
                      : "No band score yet"}
                  </p>
                </div>

                {/* Progress bar 0–9 */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>0</span>
                    <span>Band {targetBand.toFixed(1)}</span>
                    <span>9</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    {/* Target marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-indigo-300 z-10"
                      style={{ left: `${(targetBand / 9) * 100}%` }}
                    />
                    {/* Current band fill */}
                    {currentBand != null && (
                      <div
                        className={`h-full rounded-full ${
                          currentBand >= 7
                            ? "bg-emerald-500"
                            : currentBand >= 6
                            ? "bg-amber-500"
                            : "bg-red-500"
                        } transition-all`}
                        style={{ width: `${(currentBand / 9) * 100}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Mini band timeline */}
                {lastFourBands.some((b) => b != null) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Last {lastFourBands.length} essays
                    </p>
                    <div className="flex items-end gap-2 h-10">
                      {lastFourBands.map((band, i) => {
                        const colorClass =
                          band == null
                            ? "bg-slate-200"
                            : band >= 7
                            ? "bg-emerald-500"
                            : band >= 6
                            ? "bg-amber-400"
                            : "bg-red-400";
                        const heightPct =
                          band != null ? Math.max(20, (band / 9) * 100) : 20;
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <div
                              className={`w-full rounded-t ${colorClass}`}
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-xs text-slate-400">
                              {band != null ? band.toFixed(1) : "–"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personalized Coaching */}
            <Card className="border-purple-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="text-white font-bold text-base mb-2">
                  Personalized Coaching
                </h3>
                {totalEssays > 0 && topError ? (
                  <p className="text-purple-200 text-sm leading-relaxed">
                    Based on your last{" "}
                    <span className="font-semibold text-white">
                      {totalEssays}
                    </span>{" "}
                    {totalEssays === 1 ? "essay" : "essays"}, your biggest
                    limiter is{" "}
                    <span className="font-semibold text-white">
                      {topError.errorType}
                    </span>
                    . Focus here first.
                  </p>
                ) : (
                  <p className="text-purple-200 text-sm leading-relaxed">
                    Submit your first essay and I&apos;ll build a personalized
                    improvement plan for you.
                  </p>
                )}
                <Link href="/exercises" className="mt-4 inline-block">
                  <Button
                    size="sm"
                    className="bg-white text-purple-700 hover:bg-purple-50 font-semibold"
                  >
                    Start practicing →
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link href="/essay/new" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700"
                  >
                    <PenLine className="h-4 w-4 text-indigo-500" />
                    Submit New Essay
                  </Button>
                </Link>
                <Link href="/exercises" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                  >
                    <Dumbbell className="h-4 w-4 text-emerald-500" />
                    Practice Exercises
                  </Button>
                </Link>
                <Link href="/progress" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 hover:text-amber-700"
                  >
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    View Progress
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* This Week's Focus */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  This Week&apos;s Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {focusCategories.length === 0 ? (
                  <div className="space-y-2">
                    {[
                      { name: "Practise using linking words", color: "bg-blue-500", minutes: 10 },
                      { name: "Review article usage rules", color: "bg-red-500", minutes: 15 },
                      { name: "Read a model Task 2 answer", color: "bg-emerald-500", minutes: 20 },
                    ].map(({ name, color, minutes }) => (
                      <div key={name} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                        <span className="text-sm text-slate-700 flex-1">{name}</span>
                        <span className="text-xs text-slate-400 shrink-0">{minutes} min</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  focusCategories.map((cat) => {
                    const area = focusAreaMap[cat] ?? { name: cat, minutes: 15 };
                    const colors = getCategoryColors(cat);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.bar}`} />
                        <span className="text-sm text-slate-700 flex-1">
                          {area.name}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          {area.minutes} min
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
