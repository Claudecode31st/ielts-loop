import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import { MemoryInsights } from "@/components/memory-insights";
import { getStudentMemoryContext } from "@/lib/memory";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import type { ProgressDataPoint } from "@/types";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [memory, essayHistory] = await Promise.all([
    getStudentMemoryContext(session.user.id),
    db
      .select()
      .from(essays)
      .where(eq(essays.userId, session.user.id))
      .orderBy(essays.submittedAt)
      .limit(50),
  ]);

  const progressData: ProgressDataPoint[] = essayHistory.map((e) => ({
    date: format(new Date(e.submittedAt!), "MMM d"),
    overallBand: parseFloat(String(e.overallBand)) || 0,
    taskAchievement: parseFloat(String(e.taskAchievement)) || 0,
    coherenceCohesion: parseFloat(String(e.coherenceCohesion)) || 0,
    lexicalResource: parseFloat(String(e.lexicalResource)) || 0,
    grammaticalRange: parseFloat(String(e.grammaticalRange)) || 0,
  }));

  const avgScores =
    progressData.length > 0
      ? {
          overallBand: (
            progressData.reduce((s, e) => s + e.overallBand, 0) /
            progressData.length
          ).toFixed(1),
          taskAchievement: (
            progressData.reduce((s, e) => s + e.taskAchievement, 0) /
            progressData.length
          ).toFixed(1),
          coherenceCohesion: (
            progressData.reduce((s, e) => s + e.coherenceCohesion, 0) /
            progressData.length
          ).toFixed(1),
          lexicalResource: (
            progressData.reduce((s, e) => s + e.lexicalResource, 0) /
            progressData.length
          ).toFixed(1),
          grammaticalRange: (
            progressData.reduce((s, e) => s + e.grammaticalRange, 0) /
            progressData.length
          ).toFixed(1),
        }
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-brand-600" />
          Progress Analytics
        </h1>
        <p className="text-slate-500 mt-1">
          Track your band score trends across all criteria over time.
        </p>
      </div>

      {/* Average Scores */}
      {avgScores && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Avg Overall", value: avgScores.overallBand, highlight: true },
            { label: "Task Achievement", value: avgScores.taskAchievement },
            { label: "Coherence & Cohesion", value: avgScores.coherenceCohesion },
            { label: "Lexical Resource", value: avgScores.lexicalResource },
            { label: "Grammatical Range", value: avgScores.grammaticalRange },
          ].map(({ label, value, highlight }) => {
            const band = parseFloat(value);
            return (
              <Card key={label} className={highlight ? "ring-2 ring-brand-500" : ""}>
                <CardContent className="p-4 text-center">
                  <div
                    className={`text-2xl font-extrabold ${
                      band >= 7
                        ? "text-green-600"
                        : band >= 6
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {value}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-tight">
                    {label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Score Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Band Score Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart data={progressData} />
        </CardContent>
      </Card>

      {/* Memory Insights */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Learning Profile
        </h2>
        <MemoryInsights memory={memory} />
      </div>
    </div>
  );
}
