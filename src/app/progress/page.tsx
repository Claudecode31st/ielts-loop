import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, Award, Target, ArrowUp, ArrowDown, Minus, ExternalLink } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import { ErrorPatterns } from "@/components/error-patterns";
import { getStudentMemoryContext } from "@/lib/memory";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";
import type { ProgressDataPoint } from "@/types";
import { getBandColor } from "@/lib/utils";

const BAND_LABEL: Record<number, string> = {
  9: "Expert", 8: "Very Good", 7: "Good", 6: "Competent",
  5: "Modest", 4: "Limited", 3: "Extremely Limited",
};
function getBandLabel(band: number) {
  return BAND_LABEL[Math.floor(band)] ?? "";
}

function trendColor(d: number) {
  if (d > 0.09) return "text-emerald-600";
  if (d < -0.09) return "text-red-500";
  return "text-slate-400";
}
function trendArrow(d: number) {
  if (d > 0.09) return "↑";
  if (d < -0.09) return "↓";
  return "→";
}

const CRITERIA = [
  { key: "taskAchievement",   label: "Task Achievement",     abbr: "TA", color: "bg-emerald-500" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion", abbr: "CC", color: "bg-blue-500"    },
  { key: "lexicalResource",   label: "Lexical Resource",     abbr: "LR", color: "bg-violet-500"  },
  { key: "grammaticalRange",  label: "Grammatical Range",    abbr: "GR", color: "bg-amber-500"   },
] as const;

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [memory, essayHistory] = await Promise.all([
    getStudentMemoryContext(session.user.id),
    db.select().from(essays).where(eq(essays.userId, session.user.id)).orderBy(essays.submittedAt).limit(50),
  ]);

  const n = essayHistory.length;
  const isEmpty = n === 0;

  const progressData: ProgressDataPoint[] = essayHistory.map((e) => ({
    date: format(new Date(e.submittedAt!), "MMM d"),
    overallBand:       parseFloat(String(e.overallBand))       || 0,
    taskAchievement:   parseFloat(String(e.taskAchievement))   || 0,
    coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
    lexicalResource:   parseFloat(String(e.lexicalResource))   || 0,
    grammaticalRange:  parseFloat(String(e.grammaticalRange))  || 0,
  }));

  const latest = n > 0 ? progressData[n - 1] : null;
  const prev   = n > 1 ? progressData[n - 2] : null;
  const first  = n > 0 ? progressData[0] : null;

  const bestOverall  = n > 0 ? Math.max(...progressData.map((d) => d.overallBand)) : 0;
  const overallDelta = latest && prev ? latest.overallBand - prev.overallBand : null;

  // Total improvement: first essay → latest essay
  const totalImprovement = latest && first && n > 1
    ? latest.overallBand - first.overallBand
    : null;

  // Weakest criterion from latest essay
  const weakest = latest
    ? CRITERIA.reduce((w, c) =>
        (latest[c.key as keyof ProgressDataPoint] as number) < (latest[w.key as keyof ProgressDataPoint] as number) ? c : w
      )
    : null;

  const delta = (key: keyof ProgressDataPoint) =>
    latest && prev ? (latest[key] as number) - (prev[key] as number) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            My Progress
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Deep-dive into your band scores, trends, and patterns over time.
          </p>
        </div>
        {n > 0 && (
          <Link
            href="/essay/new"
            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            + Submit Essay
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto">
            <TrendingUp className="h-7 w-7 text-brand-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">No progress data yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              Submit your first essay to start tracking your band scores and error patterns.
            </p>
          </div>
          <Link
            href="/essay/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Submit First Essay
          </Link>
        </div>
      ) : (
        <>
          {/* ── Hero Stats (all unique to Progress, not on Dashboard) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {/* Latest Band */}
            <div className="col-span-2 sm:col-span-1 bg-brand-600 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[110px]">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Latest Band</p>
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold tabular-nums leading-none">
                    {latest!.overallBand.toFixed(1)}
                  </span>
                  {overallDelta !== null && overallDelta !== 0 && (
                    <span className={`text-sm font-bold pb-1 ${overallDelta > 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {overallDelta > 0 ? "+" : ""}{overallDelta.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-60 mt-1">{getBandLabel(latest!.overallBand)}</p>
              </div>
            </div>

            {/* Best ever */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">{bestOverall.toFixed(1)}</div>
                <p className="text-xs text-slate-400 mt-0.5">Best overall</p>
              </div>
            </div>

            {/* Total improvement since first essay */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                totalImprovement === null ? "bg-slate-50"
                : totalImprovement > 0 ? "bg-emerald-50"
                : totalImprovement < 0 ? "bg-red-50"
                : "bg-slate-50"
              }`}>
                {totalImprovement === null || totalImprovement === 0
                  ? <Minus className="h-4 w-4 text-slate-400" />
                  : totalImprovement > 0
                  ? <ArrowUp className="h-4 w-4 text-emerald-500" />
                  : <ArrowDown className="h-4 w-4 text-red-500" />
                }
              </div>
              <div>
                <div className={`text-3xl font-extrabold tabular-nums ${
                  totalImprovement === null ? "text-slate-300"
                  : totalImprovement > 0 ? "text-emerald-600"
                  : totalImprovement < 0 ? "text-red-500"
                  : "text-slate-400"
                }`}>
                  {totalImprovement === null
                    ? "—"
                    : `${totalImprovement > 0 ? "+" : ""}${totalImprovement.toFixed(1)}`}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalImprovement === null
                    ? "Submit more essays"
                    : totalImprovement > 0
                    ? `since first essay (${first!.overallBand.toFixed(1)} → ${latest!.overallBand.toFixed(1)})`
                    : totalImprovement < 0
                    ? `since first essay (${first!.overallBand.toFixed(1)} → ${latest!.overallBand.toFixed(1)})`
                    : "No change yet"}
                </p>
              </div>
            </div>

            {/* Weakest criterion — actionable focus */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-amber-600 tabular-nums">
                  {weakest ? (latest![weakest.key as keyof ProgressDataPoint] as number).toFixed(1) : "—"}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  {weakest ? `${weakest.abbr} — focus here first` : "No data"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Score Breakdown: latest essay scores + trend vs previous ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Latest Score by Criterion</h2>
              </div>
              {n > 1 && (
                <span className="text-[10px] text-slate-400">trend = vs previous essay</span>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {CRITERIA.map(({ key, label, abbr, color }) => {
                const val  = latest![key as keyof ProgressDataPoint] as number ?? 0;
                const d    = delta(key as keyof ProgressDataPoint);
                return (
                  <div key={key} className="px-5 py-3.5 flex items-center gap-4">
                    <span className="shrink-0 w-7 text-center text-[10px] font-bold text-slate-400">{abbr}</span>
                    <span className="w-44 shrink-0 text-sm text-slate-700">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${(val / 9) * 100}%` }} />
                    </div>
                    <span className="shrink-0 w-10 text-right text-sm font-bold text-slate-800 tabular-nums">
                      {val.toFixed(1)}
                    </span>
                    <span className={`shrink-0 w-16 text-right text-xs font-semibold tabular-nums ${n > 1 ? trendColor(d) : "text-transparent"}`}>
                      {n > 1 ? `${trendArrow(d)} ${d !== 0 ? `${d > 0 ? "+" : ""}${d.toFixed(1)}` : "same"}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Band Score Trend Chart ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Band Score Over Time</h2>
              </div>
              <span className="text-[10px] text-slate-400">{n} essay{n !== 1 ? "s" : ""} · Overall band bold</span>
            </div>
            <div className="p-4">
              <ProgressChart data={progressData} />
            </div>
          </div>

          {/* ── Essay History ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Essay History</h2>
              <p className="text-xs text-slate-400 mt-0.5">All {n} essays — click to view full feedback</p>
            </div>
            <div className="divide-y divide-slate-50">
              {[...essayHistory].reverse().map((essay, idx) => {
                const band = essay.overallBand ? parseFloat(String(essay.overallBand)) : null;
                const ta   = essay.taskAchievement   ? parseFloat(String(essay.taskAchievement))   : null;
                const cc   = essay.coherenceCohesion ? parseFloat(String(essay.coherenceCohesion)) : null;
                const lr   = essay.lexicalResource   ? parseFloat(String(essay.lexicalResource))   : null;
                const gr   = essay.grammaticalRange  ? parseFloat(String(essay.grammaticalRange))  : null;

                // Improvement vs previous (essays are reversed so idx 0 = latest)
                const prevIdx = essayHistory.length - 1 - idx - 1;
                const prevBand = prevIdx >= 0 && essayHistory[prevIdx].overallBand
                  ? parseFloat(String(essayHistory[prevIdx].overallBand))
                  : null;
                const diff = band !== null && prevBand !== null ? band - prevBand : null;

                return (
                  <Link key={essay.id} href={`/essay/${essay.id}`}>
                    <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors group">
                      {/* Essay number */}
                      <span className="shrink-0 text-xs font-bold text-slate-300 w-5 text-center tabular-nums">
                        {essayHistory.length - idx}
                      </span>

                      {/* Band */}
                      <span className={`shrink-0 text-xl font-extrabold tabular-nums w-12 ${band ? getBandColor(band) : "text-slate-200"}`}>
                        {band?.toFixed(1) ?? "—"}
                      </span>

                      {/* Delta vs previous */}
                      <span className={`shrink-0 w-12 text-xs font-semibold tabular-nums ${
                        diff === null ? "text-transparent"
                        : diff > 0 ? "text-emerald-600"
                        : diff < 0 ? "text-red-500"
                        : "text-slate-300"
                      }`}>
                        {diff !== null ? (diff > 0 ? `+${diff.toFixed(1)}` : diff === 0 ? "same" : diff.toFixed(1)) : "—"}
                      </span>

                      {/* Task type + date */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {essay.taskType === "task1" ? "T1" : "T2"}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums">
                          {format(new Date(essay.submittedAt!), "d MMM yyyy")}
                        </span>
                      </div>

                      {/* Sub-scores */}
                      <div className="flex-1 hidden sm:flex items-center gap-3">
                        {[
                          { abbr: "TA", val: ta },
                          { abbr: "CC", val: cc },
                          { abbr: "LR", val: lr },
                          { abbr: "GR", val: gr },
                        ].map(({ abbr, val }) => (
                          <span key={abbr} className="text-[10px] text-slate-400 tabular-nums">
                            <span className="font-semibold text-slate-500">{abbr}</span> {val?.toFixed(1) ?? "—"}
                          </span>
                        ))}
                      </div>

                      {/* Prompt preview */}
                      <p className="flex-1 text-xs text-slate-400 line-clamp-1 hidden lg:block">
                        {essay.prompt}
                      </p>

                      <ExternalLink className="h-3.5 w-3.5 text-slate-200 group-hover:text-brand-400 shrink-0 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Error Patterns + Skill Profile ── */}
          <ErrorPatterns memory={memory} />
        </>
      )}
    </div>
  );
}
