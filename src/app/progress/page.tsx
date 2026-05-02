import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, Award, Target, ExternalLink, ChevronUp, ChevronDown, Minus } from "lucide-react";
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
function getBandLabel(b: number) { return BAND_LABEL[Math.floor(b)] ?? ""; }

// Plain-English criterion names — students don't think in abbreviations
const CRITERIA = [
  { key: "taskAchievement",   label: "Task Achievement"     },
  { key: "coherenceCohesion", label: "Coherence & Cohesion" },
  { key: "lexicalResource",   label: "Vocabulary"           },
  { key: "grammaticalRange",  label: "Grammar"              },
] as const;

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [memory, essayHistory] = await Promise.all([
    getStudentMemoryContext(session.user.id),
    db.select().from(essays).where(eq(essays.userId, session.user.id)).orderBy(essays.submittedAt).limit(50),
  ]);

  const n = essayHistory.length;

  const progressData: ProgressDataPoint[] = essayHistory.map((e) => ({
    date:              format(new Date(e.submittedAt!), "MMM d"),
    overallBand:       parseFloat(String(e.overallBand))       || 0,
    taskAchievement:   parseFloat(String(e.taskAchievement))   || 0,
    coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
    lexicalResource:   parseFloat(String(e.lexicalResource))   || 0,
    grammaticalRange:  parseFloat(String(e.grammaticalRange))  || 0,
  }));

  const latest = n > 0 ? progressData[n - 1] : null;
  const first  = n > 0 ? progressData[0]     : null;
  const prev   = n > 1 ? progressData[n - 2] : null;

  const bestBand         = n > 0 ? Math.max(...progressData.map((d) => d.overallBand)) : 0;
  const totalImprovement = latest && first && n > 1 ? latest.overallBand - first.overallBand : null;

  // Weakest criterion in plain English
  const weakestCriterion = latest
    ? CRITERIA.reduce((w, c) =>
        (latest[c.key as keyof ProgressDataPoint] as number) <
        (latest[w.key as keyof ProgressDataPoint] as number) ? c : w
      )
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            My Progress
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">How your writing has improved over time.</p>
        </div>
        {n > 0 && (
          <Link href="/essay/new"
            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors">
            + Submit Essay
          </Link>
        )}
      </div>

      {n === 0 ? (
        /* ── Empty state ── */
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto">
            <TrendingUp className="h-7 w-7 text-brand-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Nothing to show yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              Submit your first essay and your progress will appear here.
            </p>
          </div>
          <Link href="/essay/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
            Submit First Essay
          </Link>
        </div>
      ) : (
        <>
          {/* ── 3 hero stats — all unique to this page ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Current level */}
            <div className="bg-brand-600 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[120px]">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Your Current Level</p>
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold tabular-nums leading-none">{latest!.overallBand.toFixed(1)}</span>
                  {prev && (
                    <span className={`text-sm font-bold pb-1 ${latest!.overallBand > prev.overallBand ? "text-emerald-300" : latest!.overallBand < prev.overallBand ? "text-red-300" : "opacity-50"}`}>
                      {latest!.overallBand > prev.overallBand ? `+${(latest!.overallBand - prev.overallBand).toFixed(1)}` :
                       latest!.overallBand < prev.overallBand ? (latest!.overallBand - prev.overallBand).toFixed(1) : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-60 mt-1">
                  Band {latest!.overallBand.toFixed(1)} — {getBandLabel(latest!.overallBand)}
                </p>
              </div>
            </div>

            {/* Improvement since start */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center gap-2">
                {totalImprovement === null ? (
                  <Minus className="h-4 w-4 text-slate-300" />
                ) : totalImprovement > 0 ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ChevronUp className="h-4 w-4 text-emerald-600" />
                  </div>
                ) : totalImprovement < 0 ? (
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                    <ChevronDown className="h-4 w-4 text-red-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Minus className="h-4 w-4 text-slate-400" />
                  </div>
                )}
                <p className="text-xs font-semibold text-slate-500">Overall improvement</p>
              </div>
              <div>
                {totalImprovement !== null ? (
                  <>
                    <p className={`text-3xl font-extrabold tabular-nums ${totalImprovement > 0 ? "text-emerald-600" : totalImprovement < 0 ? "text-red-500" : "text-slate-400"}`}>
                      {totalImprovement > 0 ? "+" : ""}{totalImprovement.toFixed(1)} bands
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      since your first essay ({first!.overallBand.toFixed(1)} → {latest!.overallBand.toFixed(1)})
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-extrabold text-slate-300">—</p>
                    <p className="text-xs text-slate-400 mt-0.5">Submit more essays to track improvement</p>
                  </>
                )}
              </div>
            </div>

            {/* Focus area — most actionable stat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xs font-semibold text-slate-500">Focus on next</p>
              </div>
              <div>
                {weakestCriterion ? (
                  <>
                    <p className="text-base font-bold text-slate-800 leading-snug">{weakestCriterion.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your lowest score ({(latest![weakestCriterion.key as keyof ProgressDataPoint] as number).toFixed(1)}) — improving this will raise your band fastest
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-300">Submit an essay to find out</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Band score chart — the unique centrepiece of this page ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">How your band score has changed</h2>
                <p className="text-xs text-slate-400 mt-0.5">Overall band is the bold line · individual criteria are faint</p>
              </div>
              {n === 1 && (
                <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  Submit more essays to see a trend
                </span>
              )}
            </div>
            <div className="p-4">
              <ProgressChart data={progressData} />
            </div>
          </div>

          {/* ── Essay History — full list, not available on Dashboard ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">All your essays</h2>
              <p className="text-xs text-slate-400 mt-0.5">Newest first · click any essay to re-read the feedback</p>
            </div>
            <div className="divide-y divide-slate-50">
              {[...essayHistory].reverse().map((essay, idx) => {
                const band = essay.overallBand ? parseFloat(String(essay.overallBand)) : null;
                // Compare to the essay before this one (in chronological order)
                const chronIdx = essayHistory.length - 1 - idx;
                const prevBand = chronIdx > 0 && essayHistory[chronIdx - 1].overallBand
                  ? parseFloat(String(essayHistory[chronIdx - 1].overallBand))
                  : null;
                const diff = band !== null && prevBand !== null ? band - prevBand : null;
                const isFirst = chronIdx === 0;

                return (
                  <Link key={essay.id} href={`/essay/${essay.id}`}>
                    <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/70 transition-colors group">

                      {/* Essay number */}
                      <span className="shrink-0 text-xs text-slate-300 font-bold tabular-nums w-6 text-center">
                        {essayHistory.length - idx}
                      </span>

                      {/* Band score */}
                      <span className={`shrink-0 text-2xl font-extrabold tabular-nums w-14 ${band ? getBandColor(band) : "text-slate-200"}`}>
                        {band?.toFixed(1) ?? "—"}
                      </span>

                      {/* Change pill */}
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                        isFirst ? "bg-slate-100 text-slate-400"
                        : diff === null ? "text-transparent"
                        : diff > 0 ? "bg-emerald-100 text-emerald-700"
                        : diff < 0 ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-400"
                      }`}>
                        {isFirst ? "first essay"
                          : diff === null ? "—"
                          : diff > 0 ? `↑ +${diff.toFixed(1)}`
                          : diff < 0 ? `↓ ${diff.toFixed(1)}`
                          : "→ same"}
                      </span>

                      {/* Task type + date */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {essay.taskType === "task1" ? "Task 1" : "Task 2"}
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {format(new Date(essay.submittedAt!), "d MMM yyyy")}
                        </span>
                      </div>

                      {/* Prompt preview */}
                      <p className="flex-1 text-xs text-slate-400 line-clamp-1 hidden md:block">
                        {essay.prompt}
                      </p>

                      <ExternalLink className="h-3.5 w-3.5 text-slate-200 group-hover:text-brand-400 shrink-0 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Best score callout */}
            {n > 1 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-500">
                  Your best essay scored <span className="font-bold text-emerald-600">{bestBand.toFixed(1)}</span> — keep pushing for a new personal best!
                </p>
              </div>
            )}
          </div>

          {/* ── Error patterns & skill profile ── */}
          <ErrorPatterns memory={memory} />
        </>
      )}
    </div>
  );
}
