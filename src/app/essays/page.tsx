import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText, PenLine } from "lucide-react";
import { getBandBgColor, formatDate } from "@/lib/utils";

export default async function EssaysPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const essayList = await db
    .select()
    .from(essays)
    .where(eq(essays.userId, session.user.id))
    .orderBy(desc(essays.submittedAt))
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-indigo-600" />
            Essay History
          </h1>
          <p className="text-slate-500 mt-1">
            {essayList.length} essay{essayList.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link href="/essay/new">
          <Button className="gap-2 shrink-0">
            <PenLine className="h-4 w-4" />
            New Essay
          </Button>
        </Link>
      </div>

      {essayList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-slate-600 font-medium">No essays yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Submit your first essay to get started with personalized
                feedback.
              </p>
            </div>
            <Link href="/essay/new">
              <Button>Submit Your First Essay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {essayList.map((essay) => {
            const band = parseFloat(String(essay.overallBand));
            const ta = parseFloat(String(essay.taskAchievement));
            const cc = parseFloat(String(essay.coherenceCohesion));
            const lr = parseFloat(String(essay.lexicalResource));
            const gr = parseFloat(String(essay.grammaticalRange));

            return (
              <Link key={essay.id} href={`/essay/${essay.id}`}>
                <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Overall Band */}
                      <div
                        className={`shrink-0 text-center sm:text-left`}
                      >
                        <div
                          className={`text-4xl font-extrabold ${
                            band >= 7
                              ? "text-green-600"
                              : band >= 6
                              ? "text-amber-500"
                              : "text-red-500"
                          }`}
                        >
                          {band.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Overall
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {essay.taskType === "task1" ? "Task 1" : "Task 2"}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(essay.submittedAt!)}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {essay.wordCount} words
                          </span>
                        </div>

                        <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                          {essay.prompt}
                        </p>

                        {/* Sub-scores */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: "TA", value: ta },
                            { label: "CC", value: cc },
                            { label: "LR", value: lr },
                            { label: "GR", value: gr },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="flex items-center gap-1"
                            >
                              <span className="text-xs text-slate-400 w-6">
                                {label}
                              </span>
                              <span
                                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getBandBgColor(value)}`}
                              >
                                {value.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
