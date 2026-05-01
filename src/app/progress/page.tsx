import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import { MemoryInsights } from "@/components/memory-insights";
import { getStudentMemoryContext } from "@/lib/memory";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import type { ProgressDataPoint } from "@/types";
import { getBandColor } from "@/lib/utils";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [memory, essayHistory] = await Promise.all([
    getStudentMemoryContext(session.user.id),
    db.select().from(essays).where(eq(essays.userId, session.user.id)).orderBy(essays.submittedAt).limit(50),
  ]);

  const progressData: ProgressDataPoint[] = essayHistory.map((e) => ({
    date: format(new Date(e.submittedAt!), "MMM d"),
    overallBand: parseFloat(String(e.overallBand)) || 0,
    taskAchievement: parseFloat(String(e.taskAchievement)) || 0,
    coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
    lexicalResource: parseFloat(String(e.lexicalResource)) || 0,
    grammaticalRange: parseFloat(String(e.grammaticalRange)) || 0,
  }));

  const avgScores = progressData.length > 0 ? {
    overallBand:       (progressData.reduce((s, e) => s + e.overallBand,       0) / progressData.length).toFixed(1),
    taskAchievement:   (progressData.reduce((s, e) => s + e.taskAchievement,   0) / progressData.length).toFixed(1),
    coherenceCohesion: (progressData.reduce((s, e) => s + e.coherenceCohesion, 0) / progressData.length).toFixed(1),
    lexicalResource:   (progressData.reduce((s, e) => s + e.lexicalResource,   0) / progressData.length).toFixed(1),
    grammaticalRange:  (progressData.reduce((s, e) => s + e.grammaticalRange,  0) / progressData.length).toFixed(1),
  } : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-brand-600" />
          Progress Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Band score trends across all four IELTS criteria.
        </p>
      </div>

      {/* Average Scores */}
      {avgScores && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Overall",          value: avgScores.overallBand,       highlight: true },
            { label: "Task Achievement", value: avgScores.taskAchievement },
            { label: "Coherence",        value: avgScores.coherenceCohesion },
            { label: "Vocabulary",       value: avgScores.lexicalResource },
            { label: "Grammar",          value: avgScores.grammaticalRange },
          ].map(({ label, value, highlight }) => {
            const band = parseFloat(value);
            return (
              <div
                key={label}
                className={`bg-white border rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] text-center ${highlight ? "border-brand-200" : "border-[var(--border)]"}`}
              >
                <div className={`text-2xl font-bold tabular-nums ${getBandColor(band)}`}>{value}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-tight">{label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <span className="text-sm font-semibold text-slate-800">Band Score Trends</span>
        </div>
        <div className="p-4">
          <ProgressChart data={progressData} />
        </div>
      </div>

      {/* Memory / Learning Profile */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-slate-800">Learning Profile</span>
          <span className="text-xs text-slate-400">— your recurring error patterns</span>
        </div>
        <MemoryInsights memory={memory} />
      </div>
    </div>
  );
}
