import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { essays, errorPatterns } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { EssayFeedback } from "@/components/essay-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Essay, ErrorPattern, DetailedFeedback } from "@/types";

export default async function EssayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const [essay] = await db
    .select()
    .from(essays)
    .where(and(eq(essays.id, id), eq(essays.userId, session.user.id)))
    .limit(1);

  if (!essay) {
    notFound();
  }

  // Get recurring errors for context
  const recurringErrors = await db
    .select()
    .from(errorPatterns)
    .where(eq(errorPatterns.userId, session.user.id))
    .orderBy(desc(errorPatterns.frequency))
    .limit(20);

  const typedEssay: Essay = {
    id: essay.id,
    userId: essay.userId,
    taskType: essay.taskType as "task1" | "task2",
    prompt: essay.prompt,
    content: essay.content,
    wordCount: essay.wordCount,
    submittedAt: essay.submittedAt!,
    overallBand: parseFloat(String(essay.overallBand)) || 0,
    taskAchievement: parseFloat(String(essay.taskAchievement)) || 0,
    coherenceCohesion: parseFloat(String(essay.coherenceCohesion)) || 0,
    lexicalResource: parseFloat(String(essay.lexicalResource)) || 0,
    grammaticalRange: parseFloat(String(essay.grammaticalRange)) || 0,
    feedbackSummary: essay.feedbackSummary || "",
    detailedFeedback: (essay.detailedFeedback as unknown as DetailedFeedback) || {
      errors: [],
      vocabulary: {
        overusedWords: [],
        sophisticatedUsage: [],
        suggestions: [],
        lexicalDiversity: "",
      },
      structure: {
        paragraphOrganization: "",
        cohesiveDevices: [],
        missingElements: [],
        suggestions: [],
      },
    },
    examinerComments: essay.examinerComments || "",
  };

  const typedErrors: ErrorPattern[] = recurringErrors.map((e) => ({
    id: e.id,
    userId: e.userId,
    errorType: e.errorType,
    errorCategory: e.errorCategory as ErrorPattern["errorCategory"],
    description: e.description,
    frequency: e.frequency || 1,
    lastSeenAt: e.lastSeenAt!,
    firstSeenAt: e.firstSeenAt!,
    examples:
      (e.examples as Array<{
        essayId: string;
        text: string;
        correction: string;
      }>) || [],
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link href="/essays">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All Essays
        </Button>
      </Link>

      {/* Essay Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {essay.taskType === "task1" ? "Task 1" : "Task 2"}
            </Badge>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(essay.submittedAt!)}
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {essay.wordCount} words
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Essay Feedback</h1>
        </div>
        <Link href="/essay/new">
          <Button size="sm">Submit New Essay</Button>
        </Link>
      </div>

      {/* Original Prompt */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Task Prompt
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{essay.prompt}</p>
        </CardContent>
      </Card>

      {/* Feedback */}
      <EssayFeedback essay={typedEssay} recurringErrors={typedErrors} />

      {/* Original Essay */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Your Essay ({essay.wordCount} words)
          </p>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line border-l-2 border-slate-200 pl-4">
            {essay.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
