import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, BookOpen, Award, Calendar, Target } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import { ErrorPatterns } from "@/components/error-patterns";
import { getStudentMemoryContext } from "@/lib/memory";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";
import type { ProgressDataPoint } from "@/types";

// Band descriptor labels for IELTS
const BAND_LABEL: Record<number, string> = {
  9: "Expert", 8: "Very Good", 7: "Good", 6: "Competent",
  5: "Modest", 4: "Limited", 3: "Extremely Limited",
};
function getBandLabel(band: number) {
  const rounded = Math.floor(band);
  return BAND_LABEL[rounded] ?? "";
}

// Color for criterion trend
function trendColor(delta: number) {
  if (delta > 0) return "text-emerald-600";
  if (delta < 0) return "text-red-500";
  return "text-slate-400";
}
function trendArrow(delta: number) {
  if (delta > 0.09) return "↑";
  if (delta < -0.09) return "↓";
  return "→";
}

const CRITERIA = [
  { key: "taskAchievement",   label: "Task Achievement",      abbr: "TA",  color: "bg-emerald-500" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion",  abbr: "CC",  color: "bg-blue-500"    },
  { key: "lexicalResource",   label: "Lexical Resource",      abbr: "LR",  color: "bg-violet-500"  },
  { key: "grammaticalRange",  label: "Grammatical Range",     abbr: "GR",  color: "bg-amber-500"   },
] as const;

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [memory, essayHistory] = await Promise.all([
    getStudentMemoryContext(session.user.id),
    db.select().from(essays).where(eq(essays.userId, session.user.id)).orderBy(essays.submittedAt).limit(50),
  ]);

  const progressData: ProgressDataPoint[] = essayHistory.map((e) => ({
    date: format(new Date(e.submittedAt!), "MMM d"),
    overallBand:       parseFloat(String(e.overallBand))       || 0,
    taskAchievement:   parseFloat(String(e.taskAchievement))   || 0,
    coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
    lexicalResource:   parseFloat(String(e.lexicalResource))   || 0,
    grammaticalRange:  parseFloat(String(e.grammaticalRange))  || 0,
  }));

  const n = progressData.length;
  const latest = n > 0 ? progressData[n - 1] : null;
  const prev   = n > 1 ? progressData[n - 2] : null;

  // Averages
  const avg = (key: keyof ProgressDataPoint) =>
    n > 0 ? progressData.reduce((s, e) => s + (e[key] as number), 0) / n : 0;

  const avgOverall = avg("overallBand");
  const bestOverall = n > 0 ? Math.max(...progressData.map((d) => d.overallBand)) : 0;

  // Trend = latest - previous (or 0 if not enough data)
  const delta = (key: keyof ProgressDataPoint) =>
    latest && prev ? (latest[key] as number) - (prev[key] as number) : 0;

  const overallDelta = delta("overallBand");

  // Member since
  const memberSince = essayHistory[0]
    ? format(new Date(essayHistory[0].submittedAt!), "MMM yyyy")
    : null;

  // No data
  const isEmpty = n === 0;

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
            Band score trends across all four IELTS criteria.
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
        /* ── Empty state ── */
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
          {/* ── Hero Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Overall band — biggest */}
            <div className="col-span-2 sm:col-span-1 bg-brand-600 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[110px]">
              <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">Overall Band</p>
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold tabular-nums leading-none">
                    {latest?.overallBand.toFixed(1) ?? avgOverall.toFixed(1)}
                  </span>
                  {overallDelta !== 0 && (
                    <span className={`text-sm font-bold pb-1 ${overallDelta > 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {overallDelta > 0 ? "+" : ""}{overallDelta.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-60 mt-1">{getBandLabel(latest?.overallBand ?? avgOverall)}</p>
              </div>
            </div>

            {/* Essays */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{n}</div>
                <p className="text-xs text-slate-400 mt-0.5">Essays submitted</p>
              </div>
            </div>

            {/* Best */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">{bestOverall.toFixed(1)}</div>
                <p className="text-xs text-slate-400 mt-0.5">Best overall band</p>
              </div>
            </div>

            {/* Member since */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-800">{memberSince}</div>
                <p className="text-xs text-slate-400 mt-0.5">Member since</p>
              </div>
            </div>
          </div>

          {/* ── Criteria Breakdown ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800">Score Breakdown</h2>
              <span className="text-xs text-slate-400 ml-1">— average across all essays</span>
            </div>
            <div className="divide-y divide-slate-50">
              {CRITERIA.map(({ key, label, abbr, color }) => {
                const latestVal = latest?.[key as keyof ProgressDataPoint] as number ?? 0;
                const d = delta(key as keyof ProgressDataPoint);
                const barPct = (latestVal / 9) * 100;
                return (
                  <div key={key} className="px-5 py-3.5 flex items-center gap-4">
                    {/* Abbr */}
                    <span className="shrink-0 w-8 text-center text-[10px] font-bold text-slate-400">{abbr}</span>

                    {/* Label */}
                    <span className="w-44 shrink-0 text-sm text-slate-700">{label}</span>

                    {/* Bar (based on latest) */}
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>

                    {/* Latest score */}
                    <span className="shrink-0 w-10 text-right text-sm font-bold text-slate-800 tabular-nums">
                      {latestVal.toFixed(1)}
                    </span>

                    {/* Trend vs prev */}
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
                <h2 className="text-sm font-bold text-slate-800">Band Score Trends</h2>
              </div>
              {n === 1 && (
                <span className="text-xs text-slate-400">Submit more essays to see your trend line</span>
              )}
            </div>
            <div className="p-4">
              <ProgressChart data={progressData} />
            </div>
          </div>

          {/* ── Error Patterns + Skill Profile ── */}
          <ErrorPatterns memory={memory} />
        </>
      )}
    </div>
  );
}
