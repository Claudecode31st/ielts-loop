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
  PenLine, TrendingUp, Target, Dumbbell, Brain, Clock,
  ScrollText, Sparkles, Crosshair, BarChart3, ChevronRight, Zap,
} from "lucide-react";
import { getBandColor, formatDate } from "@/lib/utils";
import { RebuildMemoryButton } from "@/components/rebuild-memory-button";

function getCategoryLabel(cat: string) {
  if (cat === "grammar") return "GRA";
  if (cat === "vocabulary") return "LR";
  if (cat === "structure") return "CC";
  return "TA";
}
function getCategoryBar(cat: string) {
  if (cat === "grammar") return "bg-red-400";
  if (cat === "vocabulary") return "bg-amber-400";
  if (cat === "structure") return "bg-blue-400";
  return "bg-emerald-400";
}
function getCategoryBadge(cat: string) {
  if (cat === "grammar") return "bg-red-50 text-red-600";
  if (cat === "vocabulary") return "bg-amber-50 text-amber-600";
  if (cat === "structure") return "bg-blue-50 text-blue-600";
  return "bg-emerald-50 text-emerald-600";
}

// ── Async data component (streams in after shell) ──────────────────────────
async function DashboardContent({ userId }: { userId: string }) {
  const [[userData], recentEssays, topErrors, [{ totalEssays }]] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(essays).where(eq(essays.userId, userId)).orderBy(desc(essays.submittedAt)).limit(4),
    db.select().from(errorPatterns).where(eq(errorPatterns.userId, userId)).orderBy(desc(errorPatterns.frequency)).limit(5),
    db.select({ totalEssays: count() }).from(essays).where(eq(essays.userId, userId)),
  ]);

  const currentBand = userData?.currentBand ? parseFloat(String(userData.currentBand)) : null;
  const targetBand = userData?.targetBand ? parseFloat(String(userData.targetBand)) : 7.0;
  const topError = topErrors[0];
  const bandColorClass = currentBand ? getBandColor(currentBand) : "text-slate-400";
  const gapToTarget = currentBand != null ? Math.max(0, targetBand - currentBand) : null;
  const lastFourBands = recentEssays.slice(0, 4).map((e) => (
    e.overallBand ? parseFloat(String(e.overallBand)) : null
  )).reverse();
  const weekFocusItems = topErrors.slice(0, 3).map((error) => {
    const freq = error.frequency ?? 1;
    return { errorType: error.errorType, errorCategory: error.errorCategory, minutes: Math.min(30, Math.max(10, freq * 5)) };
  });

  return (
    <>
      {/* Sub-header with essay count */}
      <p className="text-sm text-slate-500 -mt-3">
        Band Goal <span className="font-medium text-slate-700">{targetBand.toFixed(1)}</span>
        {" · "}
        <span className="font-medium text-slate-700">{totalEssays}</span>{" "}
        {totalEssays === 1 ? "essay" : "essays"} submitted
      </p>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <p className="text-xs text-slate-400 mb-2">Current Band</p>
          <div className={`text-2xl font-bold ${bandColorClass}`}>{currentBand != null ? currentBand.toFixed(1) : "–"}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-slate-300" />
            <span className="text-[11px] text-slate-400">overall</span>
          </div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <p className="text-xs text-slate-400 mb-2">Target Band</p>
          <div className="text-2xl font-bold text-brand-600">{targetBand.toFixed(1)}</div>
          <div className="flex items-center gap-1 mt-1">
            <Target className="h-3 w-3 text-slate-300" />
            <span className="text-[11px] text-slate-400">
              {gapToTarget != null && gapToTarget > 0 ? `${gapToTarget.toFixed(1)} to go` : gapToTarget === 0 ? "reached" : "set a goal"}
            </span>
          </div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <p className="text-xs text-slate-400 mb-2">Essays</p>
          <div className="text-2xl font-bold text-slate-800">{totalEssays}</div>
          <div className="flex items-center gap-1 mt-1">
            <ScrollText className="h-3 w-3 text-slate-300" />
            <span className="text-[11px] text-slate-400">submitted</span>
          </div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <p className="text-xs text-slate-400 mb-2">Top Error</p>
          <div className="text-sm font-semibold text-slate-800 leading-tight min-h-[28px] flex items-center">
            {topError ? topError.errorType : "None yet"}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="h-3 w-3 text-slate-300" />
            <span className="text-[11px] text-slate-400">most frequent</span>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT col (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Writing Memory */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-800">Writing Memory</span>
              </div>
              <div className="flex items-center gap-3">
                <RebuildMemoryButton />
                <Link href="/progress" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition-colors">
                  Full profile <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            {topErrors.length === 0 ? (
              <div className="py-10 text-center px-6">
                <Brain className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Submit your first essay to build your error profile</p>
                <Link href="/essay/new" className="mt-3 inline-block">
                  <Button variant="outline" size="sm" className="text-xs rounded-lg">Submit first essay</Button>
                </Link>
              </div>
            ) : (
              <div>
                {topErrors.map((error, idx) => {
                  const freq = error.frequency ?? 1;
                  const barWidth = Math.min(100, Math.max(6, (freq / 5) * 100));
                  return (
                    <div key={error.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-slate-50/60 transition-colors">
                      <span className="text-xs text-slate-300 w-4 text-center font-medium shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-medium text-slate-800 truncate capitalize">{error.errorType}</span>
                          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-px rounded-md ${getCategoryBadge(error.errorCategory)}`}>
                            {getCategoryLabel(error.errorCategory)}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-1 rounded-full ${getCategoryBar(error.errorCategory)} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 shrink-0 tabular-nums">×{freq}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Essays */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-800">Recent Essays</span>
              </div>
              <Link href="/essays" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {recentEssays.length === 0 ? (
              <div className="py-10 text-center px-6">
                <ScrollText className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">No essays submitted yet</p>
                <Link href="/essay/new">
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg text-xs">Submit first essay</Button>
                </Link>
              </div>
            ) : (
              <div>
                {recentEssays.map((essay) => {
                  const band = essay.overallBand ? parseFloat(String(essay.overallBand)) : null;
                  return (
                    <Link key={essay.id} href={`/essay/${essay.id}`}>
                      <div className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[11px] font-medium px-1.5 py-px rounded bg-slate-100 text-slate-600">
                              {essay.taskType === "task1" ? "Task 1" : "Task 2"}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />{formatDate(essay.submittedAt!)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-1 leading-snug">{essay.prompt}</p>
                        </div>
                        {band != null ? (
                          <div className={`shrink-0 text-xl font-bold tabular-nums ${getBandColor(band)}`}>{band.toFixed(1)}</div>
                        ) : (
                          <div className="shrink-0 text-sm text-slate-300">—</div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Score Blockers */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Target className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-semibold text-slate-800">Score Blockers</span>
            </div>
            <div className="p-4 space-y-2">
              {topErrors.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No data yet — submit essays to find your blockers.</p>
              ) : topErrors.slice(0, 3).map((error, idx) => {
                const impactDescriptions: Record<string, string> = {
                  grammar: "Grammatical errors lower your GRA band.",
                  vocabulary: "Limited range caps your LR band.",
                  structure: "Weak cohesion reduces your CC band.",
                };
                const desc = impactDescriptions[error.errorCategory] || "This pattern reduces your TA band.";
                const freq = error.frequency ?? 0;
                const impactColor = freq >= 5 ? "text-red-600 bg-red-50" : freq >= 3 ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-100";
                const impactLabel = freq >= 5 ? "High" : freq >= 3 ? "Medium" : "Low";
                return (
                  <div key={error.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-sm font-medium text-slate-800">{error.errorType}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-px rounded-md ${getCategoryBadge(error.errorCategory)}`}>
                          {getCategoryLabel(error.errorCategory)}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-px rounded-md ${impactColor}`}>{impactLabel}</span>
                      </div>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT col (1/3) */}
        <div className="space-y-4">
          {/* Band Progress */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-slate-800">Band Progress</span>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className={`text-5xl font-bold tabular-nums ${bandColorClass}`}>
                  {currentBand != null ? currentBand.toFixed(1) : "–"}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {currentBand != null
                    ? gapToTarget != null && gapToTarget > 0
                      ? `${gapToTarget.toFixed(1)} below Band ${targetBand.toFixed(1)} target`
                      : `Band ${targetBand.toFixed(1)} achieved`
                    : "Submit an essay to get your score"}
                </p>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>0</span><span>Target {targetBand.toFixed(1)}</span><span>9</span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="absolute top-0 h-full w-px bg-slate-300 z-10" style={{ left: `${(targetBand / 9) * 100}%` }} />
                  {currentBand != null && (
                    <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${(currentBand / 9) * 100}%` }} />
                  )}
                </div>
              </div>
              {lastFourBands.some((b) => b != null) && (
                <div>
                  <p className="text-[10px] text-slate-400 mb-2">Last {lastFourBands.length} essays</p>
                  <div className="flex items-end gap-1.5 h-8">
                    {lastFourBands.map((band, i) => {
                      const color = band == null ? "bg-slate-100" : band >= 7 ? "bg-emerald-400" : band >= 6 ? "bg-amber-400" : "bg-red-400";
                      const h = band != null ? Math.max(20, (band / 9) * 100) : 20;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className={`w-full rounded-sm ${color} transition-all duration-300`} style={{ height: `${h}%` }} />
                          <span className="text-[10px] text-slate-400 tabular-nums">{band != null ? band.toFixed(1) : "–"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personalized Coaching */}
          <div className="bg-slate-900 text-white rounded-xl overflow-hidden border border-slate-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.12)]">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">AI Coaching</span>
              </div>
              {totalEssays > 0 && topError ? (
                <p className="text-slate-400 text-xs leading-relaxed">
                  Based on <span className="text-white font-medium">{totalEssays}</span>{" "}
                  {totalEssays === 1 ? "essay" : "essays"}, your biggest limiter is{" "}
                  <span className="text-brand-400 font-medium">{topError.errorType}</span>. Focus here first.
                </p>
              ) : (
                <p className="text-slate-400 text-xs leading-relaxed">
                  Submit your first essay and I&apos;ll build a personalized plan.
                </p>
              )}
              <Link href="/exercises" className="mt-3 inline-block">
                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-medium rounded-lg border-0 h-7 text-xs px-3">
                  Start exercises <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</span>
            </div>
            <div className="p-2 space-y-0.5">
              {[
                { href: "/essay/new", icon: PenLine, label: "Submit New Essay", color: "text-brand-600" },
                { href: "/exercises", icon: Dumbbell, label: "Practice Exercises", color: "text-emerald-600" },
                { href: "/progress", icon: TrendingUp, label: "View Progress", color: "text-amber-600" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-700 hover:text-slate-900">
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  {label}
                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* This Week's Focus */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-teal-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">This Week&apos;s Focus</span>
            </div>
            <div className="p-4 space-y-2.5">
              {weekFocusItems.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Submit an essay to get your focus plan.</p>
              ) : weekFocusItems.map(({ errorType, errorCategory, minutes }) => (
                <div key={errorType} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getCategoryBar(errorCategory)}`} />
                  <span className="text-sm text-slate-700 flex-1 leading-tight capitalize">{errorType}</span>
                  <span className="text-xs text-slate-400 shrink-0 tabular-nums">{minutes} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Inline skeleton for the data section ──────────────────────────────────
function DashboardContentSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-48 -mt-3" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]"><Skeleton className="h-4 w-32" /></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-1"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-1 w-full rounded-full" /></div>
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]"><Skeleton className="h-4 w-28" /></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-1.5"><Skeleton className="h-4 w-14 rounded" /><Skeleton className="h-4 w-20 rounded" /></div>
                  <Skeleton className="h-3.5 w-full" />
                </div>
                <Skeleton className="h-6 w-10 shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl">
            <div className="px-4 py-3 border-b border-[var(--border)]"><Skeleton className="h-4 w-28" /></div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-20 mx-auto rounded-lg" />
              <Skeleton className="h-3 w-40 mx-auto" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="bg-white border border-[var(--border)] rounded-xl p-2 space-y-0.5">
            {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-9 w-full rounded-lg" />))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page shell (renders immediately on auth, no DB needed) ─────────────────
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Welcome bar renders immediately from JWT — no DB needed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Welcome back, {firstName}</h1>
          {/* Sub-header (essay count etc.) streams in below */}
        </div>
        <Link href="/essay/new">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg h-9 px-4 text-sm border-0 shrink-0">
            <PenLine className="h-4 w-4" />
            Submit Essay
          </Button>
        </Link>
      </div>

      {/* Data streams in — shows inline skeleton while loading */}
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
