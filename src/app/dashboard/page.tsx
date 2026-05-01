import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { essays, users, errorPatterns } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PenLine, TrendingUp, TrendingDown, Minus,
  Target, BookOpen, Brain, Clock,
  ScrollText, Sparkles, ChevronRight, ArrowRight,
} from "lucide-react";
import { getBandColor, formatDate } from "@/lib/utils";
import { RebuildMemoryButton } from "@/components/rebuild-memory-button";

// ── Helpers ────────────────────────────────────────────────────────────────

function catLabel(cat: string) {
  return cat === "grammar" ? "GRA" : cat === "vocabulary" ? "LR" : cat === "structure" ? "CC" : "TA";
}
function catColor(cat: string) {
  return cat === "grammar"
    ? { badge: "bg-red-50 text-red-600 border-red-100", bar: "bg-red-400", dot: "bg-red-400" }
    : cat === "vocabulary"
    ? { badge: "bg-amber-50 text-amber-600 border-amber-100", bar: "bg-amber-400", dot: "bg-amber-400" }
    : cat === "structure"
    ? { badge: "bg-blue-50 text-blue-600 border-blue-100", bar: "bg-blue-400", dot: "bg-blue-400" }
    : { badge: "bg-emerald-50 text-emerald-600 border-emerald-100", bar: "bg-emerald-400", dot: "bg-emerald-400" };
}
function impactConfig(freq: number) {
  return freq >= 5
    ? { label: "High impact", color: "text-red-600 bg-red-50 border-red-100" }
    : freq >= 3
    ? { label: "Medium impact", color: "text-amber-600 bg-amber-50 border-amber-100" }
    : { label: "Low impact", color: "text-slate-500 bg-slate-50 border-slate-200" };
}
const ERROR_TIPS: Record<string, string> = {
  grammar:    "Errors here lower your Grammatical Range & Accuracy band.",
  vocabulary: "Repetition or weak word choice limits your Lexical Resource band.",
  structure:  "Weak cohesion reduces your Coherence & Cohesion band.",
  coherence:  "Poor paragraph flow reduces your Coherence & Cohesion band.",
};

// ── Data ───────────────────────────────────────────────────────────────────

async function DashboardContent({ userId }: { userId: string }) {
  const [[userData], recentEssays, topErrors, [{ totalEssays }]] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(essays).where(eq(essays.userId, userId)).orderBy(desc(essays.submittedAt)).limit(5),
    db.select().from(errorPatterns).where(eq(errorPatterns.userId, userId)).orderBy(desc(errorPatterns.frequency)).limit(5),
    db.select({ totalEssays: count() }).from(essays).where(eq(essays.userId, userId)),
  ]);

  const currentBand  = userData?.currentBand ? parseFloat(String(userData.currentBand)) : null;
  const targetBand   = userData?.targetBand  ? parseFloat(String(userData.targetBand))  : 7.0;
  const gapToTarget  = currentBand != null ? Math.max(0, targetBand - currentBand) : null;

  // Trend: compare latest essay band vs previous
  const bands = recentEssays
    .map((e) => e.overallBand ? parseFloat(String(e.overallBand)) : null)
    .filter((b): b is number => b != null);
  const latestBand   = bands[0] ?? null;
  const previousBand = bands[1] ?? null;
  const trendDelta   = latestBand != null && previousBand != null ? latestBand - previousBand : null;

  // Sparkline oldest→newest (up to 5)
  const sparkBands = [...bands].reverse();

  const bandColorClass = currentBand ? getBandColor(currentBand) : "text-slate-300";

  return (
    <>
      {/* ── Overview strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current band */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] flex flex-col gap-1">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Current Band</p>
          <p className={`text-4xl font-extrabold tabular-nums leading-none ${bandColorClass}`}>
            {currentBand != null ? currentBand.toFixed(1) : "–"}
          </p>
          {trendDelta != null && (
            <div className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${trendDelta > 0 ? "text-emerald-600" : trendDelta < 0 ? "text-red-500" : "text-slate-400"}`}>
              {trendDelta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : trendDelta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              {trendDelta > 0 ? `+${trendDelta.toFixed(1)}` : trendDelta < 0 ? trendDelta.toFixed(1) : "No change"} from last essay
            </div>
          )}
          {trendDelta == null && (
            <p className="text-[11px] text-slate-400 mt-0.5">{currentBand != null ? "First essay" : "No essays yet"}</p>
          )}
        </div>

        {/* Gap to target */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] flex flex-col gap-1">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Gap to Target</p>
          <p className="text-4xl font-extrabold tabular-nums leading-none text-brand-600">
            {gapToTarget != null && gapToTarget > 0 ? `${gapToTarget.toFixed(1)}` : gapToTarget === 0 ? "🎉" : "–"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {gapToTarget != null && gapToTarget > 0
              ? `bands below ${targetBand.toFixed(1)} target`
              : gapToTarget === 0 ? "Target reached!" : `Target: ${targetBand.toFixed(1)}`}
          </p>
        </div>

        {/* Essays submitted */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] flex flex-col gap-1">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Essays</p>
          <p className="text-4xl font-extrabold tabular-nums leading-none text-slate-800">{totalEssays}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totalEssays === 0 ? "Submit your first" : totalEssays === 1 ? "submitted so far" : "submitted so far"}
          </p>
        </div>

        {/* Top error */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] flex flex-col gap-1">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">#1 Score Blocker</p>
          {topErrors[0] ? (
            <>
              <p className="text-sm font-bold text-slate-800 leading-snug capitalize mt-0.5">{topErrors[0].errorType}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-px rounded border ${catColor(topErrors[0].errorCategory).badge}`}>
                  {catLabel(topErrors[0].errorCategory)}
                </span>
                <span className="text-[11px] text-slate-400">seen ×{topErrors[0].frequency ?? 1}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-300 leading-snug mt-0.5">None yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">submit an essay to find out</p>
            </>
          )}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Left 2/3 ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Score Blockers — renamed, more actionable */}
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-600" />
                <div>
                  <span className="text-sm font-semibold text-slate-800">Your Score Blockers</span>
                  <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">patterns found across your essays</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RebuildMemoryButton />
                <Link href="/progress" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5 font-medium">
                  Full profile <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {topErrors.length === 0 ? (
              <div className="py-14 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-brand-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">No patterns found yet</p>
                <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
                  Submit your first essay and the AI will start building your personal error profile.
                </p>
                <Link href="/essay/new">
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-xl text-xs gap-1.5">
                    <PenLine className="h-3.5 w-3.5" /> Submit first essay
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {topErrors.map((error, idx) => {
                  const freq   = error.frequency ?? 1;
                  // Absolute scale: 1 occurrence = 10%, 10+ = 100%
                  const barPct = Math.min(100, freq * 10);
                  const cc     = catColor(error.errorCategory);
                  const imp    = impactConfig(freq);
                  const tip    = ERROR_TIPS[error.errorCategory] ?? "This pattern is reducing your overall band score.";
                  return (
                    <div key={error.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Rank */}
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-slate-800 capitalize">{error.errorType}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-px rounded border ${cc.badge}`}>{catLabel(error.errorCategory)}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-px rounded border ${imp.color}`}>{imp.label}</span>
                          </div>
                          {/* Tip */}
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{tip}</p>
                          {/* Bar — absolute scale, 10 occurrences = full */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cc.bar} transition-all duration-500`}
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 tabular-nums shrink-0 w-7 text-right">×{freq}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {topErrors.length > 0 && (
              <div className="px-5 py-3 border-t border-[var(--border)] bg-slate-50/60">
                <Link href="/exercises" className="flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate exercises targeting these errors
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Essays */}
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-800">Recent Essays</span>
              </div>
              <Link href="/essays" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5 font-medium">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {recentEssays.length === 0 ? (
              <div className="py-14 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <ScrollText className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">No essays yet</p>
                <p className="text-xs text-slate-400 mb-4">Submit your first essay to get detailed AI feedback.</p>
                <Link href="/essay/new">
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-xl text-xs gap-1.5">
                    <PenLine className="h-3.5 w-3.5" /> Submit first essay
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentEssays.map((essay) => {
                  const band = essay.overallBand ? parseFloat(String(essay.overallBand)) : null;
                  return (
                    <Link key={essay.id} href={`/essay/${essay.id}`}>
                      <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
                        {/* Band score */}
                        <div className="shrink-0 w-12 text-right">
                          {band != null
                            ? <span className={`text-2xl font-extrabold tabular-nums ${getBandColor(band)}`}>{band.toFixed(1)}</span>
                            : <span className="text-lg text-slate-200 font-bold">—</span>}
                        </div>
                        {/* Divider */}
                        <div className="w-px h-8 bg-slate-100 shrink-0" />
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-semibold px-1.5 py-px rounded-md bg-slate-100 text-slate-600">
                              {essay.taskType === "task1" ? "Task 1" : "Task 2"}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />{formatDate(essay.submittedAt!)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-1">{essay.prompt}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-200 shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right 1/3 ── */}
        <div className="space-y-4">

          {/* Progress trend — no repeated score, just trend & sparkline */}
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-slate-800">Progress Trend</span>
            </div>
            <div className="p-4 space-y-4">
              {/* Gap to target — visual pill */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400 mb-0.5">Target</p>
                  <p className="text-lg font-bold text-brand-600 tabular-nums">{targetBand.toFixed(1)}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  gapToTarget === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : gapToTarget != null ? "bg-brand-50 text-brand-700 border-brand-100"
                  : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                  {gapToTarget === 0 ? "🎉 Reached!" : gapToTarget != null ? `${gapToTarget.toFixed(1)} to go` : "No data yet"}
                </div>
              </div>

              {/* Progress bar */}
              {currentBand != null && (
                <div>
                  <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all duration-500"
                      style={{ width: `${(currentBand / 9) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-brand-300 z-10"
                      style={{ left: `${(targetBand / 9) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-300 mt-1">
                    <span>0</span><span>Target {targetBand.toFixed(1)}</span><span>9.0</span>
                  </div>
                </div>
              )}

              {/* Sparkline */}
              {sparkBands.length > 0 ? (
                <div>
                  <p className="text-[11px] text-slate-400 mb-2">Band over last {sparkBands.length} essay{sparkBands.length > 1 ? "s" : ""}</p>
                  <div className="flex items-end gap-1.5 h-12">
                    {sparkBands.map((band, i) => {
                      const color = band >= 7 ? "bg-emerald-400" : band >= 6 ? "bg-amber-400" : "bg-red-400";
                      const h = Math.max(15, (band / 9) * 100);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full rounded-sm ${color}`} style={{ height: `${h}%` }} />
                          <span className="text-[9px] text-slate-400 tabular-nums">{band.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 text-center py-4">
                  Submit essays to see your trend
                </p>
              )}

              {/* Trend commentary */}
              {trendDelta != null && (
                <div className={`flex items-start gap-2 p-3 rounded-xl text-xs leading-relaxed ${
                  trendDelta > 0 ? "bg-emerald-50 text-emerald-700"
                  : trendDelta < 0 ? "bg-red-50 text-red-700"
                  : "bg-slate-50 text-slate-500"
                }`}>
                  {trendDelta > 0
                    ? <><TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5" /> Your score improved by <strong className="mx-0.5">+{trendDelta.toFixed(1)}</strong> since your last essay. Keep going!</>
                    : trendDelta < 0
                    ? <><TrendingDown className="h-3.5 w-3.5 shrink-0 mt-0.5" /> Score dipped by <strong className="mx-0.5">{trendDelta.toFixed(1)}</strong>. Focus on the top errors below.</>
                    : <><Minus className="h-3.5 w-3.5 shrink-0 mt-0.5" /> Score held steady. Push to fix one error pattern this week.</>}
                </div>
              )}
            </div>
          </div>

          {/* Next step card */}
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-4 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 opacity-80" />
                <span className="text-xs font-bold uppercase tracking-wide opacity-80">What to do next</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {totalEssays === 0
                  ? "Submit your first essay to unlock your personalised coaching plan."
                  : topErrors.length > 0
                  ? <>Practice fixing <span className="font-bold">{topErrors[0].errorType}</span> — it&apos;s your #1 score blocker right now.</>
                  : "Keep writing! More essays sharpen your feedback and error profile."}
              </p>
              <Link href={totalEssays === 0 ? "/essay/new" : "/exercises"}>
                <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                  {totalEssays === 0 ? "Submit Essay" : "Start Exercises"} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

            <div className="p-2">
              {[
                { href: "/essay/new",  icon: PenLine,    label: "Submit Essay",        color: "text-brand-600",   bg: "bg-brand-50"   },
                { href: "/exercises",  icon: BookOpen,   label: "Practice Exercises",  color: "text-emerald-600", bg: "bg-emerald-50" },
                { href: "/progress",   icon: TrendingUp, label: "View Full Progress",   color: "text-amber-600",   bg: "bg-amber-50"   },
                { href: "/profile",    icon: Target,     label: "Update Target Band",   color: "text-slate-500",   bg: "bg-slate-50"   },
              ].map(({ href, icon: Icon, label, color, bg }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 flex-1">{label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-200 group-hover:text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-2xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]"><Skeleton className="h-4 w-36" /></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-5 py-4 border-b border-[var(--border)] last:border-0">
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-10 rounded" /><Skeleton className="h-4 w-16 rounded" /></div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]"><Skeleton className="h-4 w-28" /></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--border)] last:border-0">
                <Skeleton className="h-7 w-10 shrink-0" />
                <div className="w-px h-8 bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-1.5"><Skeleton className="h-4 w-12 rounded-md" /><Skeleton className="h-4 w-20" /></div>
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[var(--border)]"><Skeleton className="h-4 w-28" /></div>
            <div className="p-4 space-y-4">
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back,{" "}
            <span className="relative inline-block">
              {firstName}
              <span className="absolute left-0 -bottom-0.5 w-full h-0.5 rounded-full bg-brand-600" />
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Here&apos;s your writing progress at a glance.</p>
        </div>
        <Link href="/essay/new">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl h-9 px-4 text-sm border-0 shrink-0">
            <PenLine className="h-4 w-4" /> Submit Essay
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
