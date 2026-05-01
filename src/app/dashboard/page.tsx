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
  PenLine, TrendingUp, Target, BookOpen, Brain,
  Clock, ScrollText, Sparkles, ChevronRight, Zap,
} from "lucide-react";
import { getBandColor, formatDate } from "@/lib/utils";
import { RebuildMemoryButton } from "@/components/rebuild-memory-button";

// ── Helpers ────────────────────────────────────────────────────────────────

function catLabel(cat: string) {
  return cat === "grammar" ? "GRA" : cat === "vocabulary" ? "LR" : cat === "structure" ? "CC" : "TA";
}
function catBar(cat: string) {
  return cat === "grammar" ? "bg-red-400" : cat === "vocabulary" ? "bg-amber-400" : cat === "structure" ? "bg-blue-400" : "bg-emerald-400";
}
function catBadge(cat: string) {
  return cat === "grammar" ? "bg-red-50 text-red-600" : cat === "vocabulary" ? "bg-amber-50 text-amber-600" : cat === "structure" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";
}

// ── Async data ─────────────────────────────────────────────────────────────

async function DashboardContent({ userId }: { userId: string }) {
  const [[userData], recentEssays, topErrors, [{ totalEssays }]] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(essays).where(eq(essays.userId, userId)).orderBy(desc(essays.submittedAt)).limit(4),
    db.select().from(errorPatterns).where(eq(errorPatterns.userId, userId)).orderBy(desc(errorPatterns.frequency)).limit(5),
    db.select({ totalEssays: count() }).from(essays).where(eq(essays.userId, userId)),
  ]);

  const currentBand = userData?.currentBand ? parseFloat(String(userData.currentBand)) : null;
  const targetBand  = userData?.targetBand  ? parseFloat(String(userData.targetBand))  : 7.0;
  const topError    = topErrors[0];
  const gapToTarget = currentBand != null ? Math.max(0, targetBand - currentBand) : null;

  // Sparkline: last 4 essays oldest→newest
  const sparkBands = recentEssays.slice(0, 4).map((e) =>
    e.overallBand ? parseFloat(String(e.overallBand)) : null
  ).reverse();

  const bandColorClass = currentBand ? getBandColor(currentBand) : "text-slate-400";

  return (
    <>
      {/* ── Compact stats bar ── */}
      <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border)]">
          {[
            {
              label: "Current Band",
              value: currentBand != null ? currentBand.toFixed(1) : "–",
              sub: currentBand != null
                ? gapToTarget! > 0 ? `${gapToTarget!.toFixed(1)} below target` : "Target reached 🎉"
                : "No essays yet",
              valueClass: bandColorClass,
              icon: TrendingUp,
            },
            {
              label: "Target Band",
              value: targetBand.toFixed(1),
              sub: "your goal",
              valueClass: "text-brand-600",
              icon: Target,
            },
            {
              label: "Essays",
              value: String(totalEssays),
              sub: totalEssays === 1 ? "submitted" : "submitted",
              valueClass: "text-slate-800",
              icon: ScrollText,
            },
            {
              label: "#1 Error",
              value: topError ? topError.errorType : "None yet",
              sub: topError ? `×${topError.frequency ?? 1} occurrences` : "submit an essay",
              valueClass: "text-slate-800",
              icon: Zap,
              small: true,
            },
          ].map(({ label, value, sub, valueClass, icon: Icon, small }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-[var(--border)] flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
                <p className={`font-bold tabular-nums truncate ${small ? "text-sm leading-snug" : "text-xl"} ${valueClass}`}>{value}</p>
                <p className="text-[10px] text-slate-400 truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Left col (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Writing Memory */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-800">Writing Memory</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">— your recurring error patterns</span>
              </div>
              <div className="flex items-center gap-3">
                <RebuildMemoryButton />
                <Link href="/progress" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition-colors">
                  Full profile <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {topErrors.length === 0 ? (
              <div className="py-12 text-center px-6">
                <Brain className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">Submit your first essay to build your error profile</p>
                <Link href="/essay/new">
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg text-xs">Submit first essay</Button>
                </Link>
              </div>
            ) : (
              <div>
                {topErrors.map((error, idx) => {
                  const freq = error.frequency ?? 1;
                  const barWidth = Math.min(100, Math.max(6, (freq / (topErrors[0]?.frequency ?? 1)) * 100));
                  const impactLabel = freq >= 5 ? "High" : freq >= 3 ? "Medium" : "Low";
                  const impactColor = freq >= 5 ? "text-red-600 bg-red-50" : freq >= 3 ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-50";
                  return (
                    <div key={error.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-slate-50/60 transition-colors">
                      <span className="text-xs text-slate-300 w-4 text-center font-bold shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-sm font-medium text-slate-800 capitalize">{error.errorType}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-px rounded-md ${catBadge(error.errorCategory)}`}>{catLabel(error.errorCategory)}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-px rounded-md ${impactColor}`}>{impactLabel}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-1 rounded-full ${catBar(error.errorCategory)} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 shrink-0 tabular-nums">×{freq}</span>
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
              <div className="py-12 text-center px-6">
                <ScrollText className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">No essays yet</p>
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
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-medium px-1.5 py-px rounded bg-slate-100 text-slate-600 shrink-0">
                              {essay.taskType === "task1" ? "Task 1" : "Task 2"}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
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
        </div>

        {/* ── Right col (1/3) ── */}
        <div className="space-y-4">

          {/* Band Progress — consolidated */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-slate-800">Band Progress</span>
            </div>
            <div className="p-5">
              {/* Big score */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[11px] text-slate-400 mb-0.5">Current</p>
                  <span className={`text-5xl font-extrabold tabular-nums ${bandColorClass}`}>
                    {currentBand != null ? currentBand.toFixed(1) : "–"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 mb-0.5">Target</p>
                  <span className="text-2xl font-bold text-brand-600 tabular-nums">{targetBand.toFixed(1)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="absolute top-0 h-full w-0.5 bg-brand-200 z-10" style={{ left: `${(targetBand / 9) * 100}%` }} />
                {currentBand != null && (
                  <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${(currentBand / 9) * 100}%` }} />
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-4">
                <span>0</span><span>Band {targetBand.toFixed(1)} target</span><span>9</span>
              </div>

              {/* Sparkline */}
              {sparkBands.some((b) => b != null) ? (
                <div>
                  <p className="text-[10px] text-slate-400 mb-2">Last {sparkBands.length} essays</p>
                  <div className="flex items-end gap-1.5 h-10">
                    {sparkBands.map((band, i) => {
                      const color = band == null ? "bg-slate-100" : band >= 7 ? "bg-emerald-400" : band >= 6 ? "bg-amber-400" : "bg-red-400";
                      const h = band != null ? Math.max(20, (band / 9) * 100) : 20;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className={`w-full rounded-sm ${color} transition-all`} style={{ height: `${h}%` }} />
                          <span className="text-[9px] text-slate-400 tabular-nums">{band != null ? band.toFixed(1) : "–"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 text-center pt-1">Submit essays to track your trend</p>
              )}
            </div>
          </div>

          {/* AI Coaching + Quick Actions — merged */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Coaching insight */}
            <div className="p-4 bg-brand-50 border-b border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">AI Coaching</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {totalEssays > 0 && topError
                  ? <>Based on <span className="font-semibold text-slate-800">{totalEssays}</span> {totalEssays === 1 ? "essay" : "essays"}, your biggest limiter is <span className="font-semibold text-brand-700">{topError.errorType}</span>. Target this first.</>
                  : <>Submit your first essay and I&apos;ll identify your personal score blockers.</>
                }
              </p>
            </div>

            {/* Quick actions */}
            <div className="p-2">
              {[
                { href: "/essay/new",  icon: PenLine,    label: "Submit New Essay",    color: "text-brand-600",   bg: "bg-brand-50"   },
                { href: "/exercises",  icon: BookOpen,   label: "Practice Exercises",  color: "text-emerald-600", bg: "bg-emerald-50" },
                { href: "/progress",   icon: TrendingUp, label: "View Progress",        color: "text-amber-600",   bg: "bg-amber-50"   },
              ].map(({ href, icon: Icon, label, color, bg }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">{label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400" />
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
      {/* Stats bar skeleton */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]"><Skeleton className="h-4 w-32" /></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
                <Skeleton className="h-3 w-3 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3.5 w-8 rounded-md" /></div>
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
                <Skeleton className="h-3 w-6 shrink-0" />
              </div>
            ))}
          </div>
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]"><Skeleton className="h-4 w-28" /></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex-1 space-y-1">
                  <div className="flex gap-1.5"><Skeleton className="h-4 w-12 rounded" /><Skeleton className="h-4 w-20 rounded" /></div>
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
                <Skeleton className="h-6 w-10 shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]"><Skeleton className="h-4 w-28" /></div>
            <div className="p-5 space-y-4">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back,{" "}
            <span className="relative inline-block">
              {firstName}
              <span className="absolute left-0 -bottom-0.5 w-full h-0.5 rounded-full bg-brand-600" />
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Here&apos;s where you stand today.</p>
        </div>
        <Link href="/essay/new">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg h-9 px-4 text-sm border-0 shrink-0">
            <PenLine className="h-4 w-4" />
            Submit Essay
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
