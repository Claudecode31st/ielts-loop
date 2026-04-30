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
  Dumbbell,
  Brain,
  Clock,
  ScrollText,
  Sparkles,
  Crosshair,
  BarChart3,
  BookMarked,
  ChevronRight,
  Trophy,
  Zap,
} from "lucide-react";
import { getBandColor, getBandBgColor, formatDate } from "@/lib/utils";
import { RebuildMemoryButton } from "@/components/rebuild-memory-button";

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

  // This Week's Focus — derived from the student's top 3 recurring errors.
  // Each item shows the actual error type and a practice time weighted by frequency.
  const weekFocusItems = topErrors.slice(0, 3).map((error) => {
    const freq = error.frequency ?? 1;
    // More frequent = more practice minutes (10–30 min range)
    const minutes = Math.min(30, Math.max(10, freq * 5));
    return {
      errorType: error.errorType,
      errorCategory: error.errorCategory,
      minutes,
    };
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Welcome Bar ── */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl shadow-brand-100/30 rounded-2xl border-l-4 border-l-brand-600 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome back, {firstName}
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
                className="gap-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 shrink-0 border-0"
              >
                <PenLine className="h-5 w-5" />
                Submit New Essay
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Current Band */}
          <Card variant="default">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
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
          <Card variant="default">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-md">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-slate-400">goal</span>
              </div>
              <div className="text-3xl font-extrabold text-brand-600">
                {targetBand.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Target Band</p>
            </CardContent>
          </Card>

          {/* Essays Submitted */}
          <Card variant="default">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                  <ScrollText className="h-5 w-5 text-white" />
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
          <Card variant="default">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md">
                  <Zap className="h-5 w-5 text-white" />
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
            <Card variant="glass" className="overflow-hidden">
              <CardHeader className="pb-3 border-b border-brand-100/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base font-bold text-brand-900">
                      Writing Memory — Your Error Profile
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <RebuildMemoryButton />
                    <Link
                      href="/progress"
                      className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                    >
                      View full memory <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {topErrors.length === 0 ? (
                  <div className="py-10 text-center px-6">
                    <Brain className="h-10 w-10 text-brand-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      Submit your first essay to build your memory profile
                    </p>
                    <Link href="/essay/new" className="mt-3 inline-block">
                      <Button variant="outline" size="sm" className="border-brand-300 text-brand-700 hover:bg-brand-50 rounded-xl">
                        Submit first essay
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/40">
                    {topErrors.map((error, idx) => {
                      const colors = getCategoryColors(error.errorCategory);
                      const freq = error.frequency ?? 1;
                      // Absolute scale: 1 essay = 20%, 5+ essays = 100%
                      const barWidth = Math.min(100, Math.max(8, (freq / 5) * 100));
                      const severityLabel = freq >= 5 ? "High" : freq >= 3 ? "Medium" : freq >= 2 ? "Low" : null;
                      const severityStyle = freq >= 5
                        ? "bg-red-100 text-red-600"
                        : freq >= 3
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-500";
                      return (
                        <div key={error.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-brand-50/30 transition-all duration-200">
                          {/* Rank */}
                          <span className="text-xs font-bold text-slate-300 w-4 shrink-0 text-center">
                            {idx + 1}
                          </span>
                          {/* Name + bar */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <p className="text-sm font-semibold text-slate-800 truncate capitalize">
                                {error.errorType}
                              </p>
                              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-px rounded-full ${colors.bg} ${colors.text}`}>
                                {getCategoryLabel(error.errorCategory)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${colors.bar} transition-all duration-500`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                          {/* Frequency + severity */}
                          <div className="shrink-0 text-right space-y-0.5">
                            <div className="text-sm font-bold text-slate-600">×{freq}</div>
                            {severityLabel && (
                              <div className={`text-[10px] font-semibold px-1.5 py-px rounded-full ${severityStyle}`}>
                                {severityLabel}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Essays */}
            <Card variant="glass">
              <CardHeader className="pb-3 border-b border-white/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
                      <ScrollText className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Recent Essays
                    </CardTitle>
                  </div>
                  <Link
                    href="/essays"
                    className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                  >
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentEssays.length === 0 ? (
                  <div className="py-12 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                      <ScrollText className="h-8 w-8 text-brand-200" />
                    </div>
                    <p className="text-slate-700 font-medium mb-1">
                      No essays yet
                    </p>
                    <p className="text-slate-400 text-sm mb-4">
                      Submit your first essay and get your IELTS band score in seconds.
                    </p>
                    <Link href="/essay/new">
                      <Button size="sm" className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-xl border-0">
                        Submit your first essay
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/40">
                    {recentEssays.map((essay) => {
                      const band = essay.overallBand
                        ? parseFloat(String(essay.overallBand))
                        : null;
                      return (
                        <Link key={essay.id} href={`/essay/${essay.id}`}>
                          <div className="flex items-start gap-4 px-5 py-4 hover:bg-brand-50/50 rounded-xl transition-all duration-200 cursor-pointer">
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
            <Card variant="glass">
              <CardHeader className="pb-3 border-b border-white/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Top Score Blockers
                  </CardTitle>
                </div>
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
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-sm">
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
            <Card variant="glass">
              <CardHeader className="pb-3 border-b border-white/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 shadow-sm">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Band Progress
                  </CardTitle>
                </div>
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
                  <div className="relative h-3 bg-slate-100/80 rounded-full overflow-hidden">
                    {/* Target marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-brand-300 z-10"
                      style={{ left: `${(targetBand / 9) * 100}%` }}
                    />
                    {/* Current band fill */}
                    {currentBand != null && (
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-700 transition-all duration-500"
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
                              className={`w-full rounded-t ${colorClass} transition-all duration-300`}
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
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 shadow-2xl shadow-brand-500/30 rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-brand-200" />
                  <h3 className="text-white font-bold text-base">
                    Personalized Coaching
                  </h3>
                </div>
                {totalEssays > 0 && topError ? (
                  <p className="text-brand-200 text-sm leading-relaxed">
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
                  <p className="text-brand-200 text-sm leading-relaxed">
                    Submit your first essay and I&apos;ll build a personalized
                    improvement plan for you.
                  </p>
                )}
                <Link href="/exercises" className="mt-4 inline-block">
                  <Button
                    size="sm"
                    className="bg-white text-brand-700 hover:bg-brand-50 font-semibold rounded-xl border-0"
                  >
                    Start practicing
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <Card variant="glass">
              <CardHeader className="pb-3 border-b border-white/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link href="/essay/new" className="block">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 border border-white/60 hover:bg-brand-50/60 hover:border-brand-200 text-slate-700 hover:text-brand-700 transition-all duration-200 text-sm font-medium">
                    <PenLine className="h-4 w-4 text-brand-600 shrink-0" />
                    Submit New Essay
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                </Link>
                <Link href="/exercises" className="block">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 border border-white/60 hover:bg-emerald-50/60 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 transition-all duration-200 text-sm font-medium">
                    <Dumbbell className="h-4 w-4 text-emerald-500 shrink-0" />
                    Practice Exercises
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                </Link>
                <Link href="/progress" className="block">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 border border-white/60 hover:bg-amber-50/60 hover:border-amber-200 text-slate-700 hover:text-amber-700 transition-all duration-200 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />
                    View Progress
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                </Link>
              </CardContent>
            </Card>

            {/* This Week's Focus */}
            <Card variant="glass">
              <CardHeader className="pb-3 border-b border-white/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm">
                    <Crosshair className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    This Week&apos;s Focus
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {weekFocusItems.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2 text-center">
                    Submit an essay to get your personalised focus plan.
                  </p>
                ) : (
                  weekFocusItems.map(({ errorType, errorCategory, minutes }) => {
                    const colors = getCategoryColors(errorCategory);
                    // Capitalise the error type for display
                    const displayName =
                      errorType.charAt(0).toUpperCase() + errorType.slice(1);
                    return (
                      <div key={errorType} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.bar}`} />
                        <span className="text-sm text-slate-700 flex-1 leading-tight">
                          {displayName}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          {minutes} min
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
