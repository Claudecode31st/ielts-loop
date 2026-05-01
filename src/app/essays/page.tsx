import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, FileText, PenLine } from "lucide-react";
import { getBandColor, getBandBgColor, formatDate } from "@/lib/utils";

export default async function EssaysPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const essayList = await db
    .select()
    .from(essays)
    .where(eq(essays.userId, session.user.id))
    .orderBy(desc(essays.submittedAt))
    .limit(50);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-brand-600" />
            Essay History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {essayList.length} {essayList.length === 1 ? "essay" : "essays"} submitted
          </p>
        </div>
        <Link href="/essay/new">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg h-9 px-4 text-sm">
            <PenLine className="h-3.5 w-3.5" />
            New Essay
          </Button>
        </Link>
      </div>

      {essayList.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] py-16 text-center px-6 space-y-3">
          <BookOpen className="h-10 w-10 text-slate-200 mx-auto" />
          <div>
            <p className="text-sm font-medium text-slate-700">No essays yet</p>
            <p className="text-xs text-slate-400 mt-1">Submit your first essay to get personalized IELTS feedback.</p>
          </div>
          <Link href="/essay/new">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg text-sm">Submit Essay</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
          {essayList.map((essay, i) => {
            const band = parseFloat(String(essay.overallBand));
            const ta   = parseFloat(String(essay.taskAchievement));
            const cc   = parseFloat(String(essay.coherenceCohesion));
            const lr   = parseFloat(String(essay.lexicalResource));
            const gr   = parseFloat(String(essay.grammaticalRange));

            return (
              <Link key={essay.id} href={`/essay/${essay.id}`}>
                <div className={`flex items-start gap-4 px-4 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer ${i !== 0 ? "border-t border-[var(--border)]" : ""}`}>

                  {/* Band score */}
                  <div className="shrink-0 w-12 text-right">
                    <div className={`text-xl font-bold tabular-nums ${getBandColor(band)}`}>
                      {band.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-400">overall</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[11px] font-medium px-1.5 py-px rounded bg-slate-100 text-slate-600">
                        {essay.taskType === "task1" ? "Task 1" : "Task 2"}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(essay.submittedAt!)}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {essay.wordCount}w
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 line-clamp-1 leading-snug mb-2">
                      {essay.prompt}
                    </p>

                    {/* Sub-scores */}
                    <div className="flex items-center gap-3">
                      {[
                        { label: "TA", value: ta },
                        { label: "CC", value: cc },
                        { label: "LR", value: lr },
                        { label: "GR", value: gr },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">{label}</span>
                          <span className={`text-[11px] font-semibold px-1 py-px rounded ${getBandBgColor(value)}`}>
                            {value.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
