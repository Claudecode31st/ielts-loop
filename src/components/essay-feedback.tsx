"use client";

import { BandScoreCard } from "@/components/band-score-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, BookOpen, AlignLeft } from "lucide-react";
import type { Essay, ErrorPattern } from "@/types";

interface EssayFeedbackProps {
  essay: Essay;
  recurringErrors?: ErrorPattern[];
}

export function EssayFeedback({ essay, recurringErrors = [] }: EssayFeedbackProps) {
  const feedback = essay.detailedFeedback;
  const scores = {
    overallBand: parseFloat(String(essay.overallBand)),
    taskAchievement: parseFloat(String(essay.taskAchievement)),
    coherenceCohesion: parseFloat(String(essay.coherenceCohesion)),
    lexicalResource: parseFloat(String(essay.lexicalResource)),
    grammaticalRange: parseFloat(String(essay.grammaticalRange)),
  };

  function getRecurringCount(errorText: string, explanation: string): number {
    const matching = recurringErrors.find(
      (e) =>
        explanation.toLowerCase().includes(e.errorType.toLowerCase()) ||
        e.errorType.toLowerCase().includes(explanation.toLowerCase().slice(0, 20))
    );
    return matching?.frequency || 0;
  }

  const categoryColors: Record<string, string> = {
    grammar: "bg-red-100 text-red-700",
    vocabulary: "bg-blue-100 text-blue-700",
    structure: "bg-purple-100 text-purple-700",
    coherence: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      {/* Band Scores */}
      <BandScoreCard scores={scores} />

      {/* Examiner Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Examiner&apos;s Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {essay.examinerComments}
          </p>
          {(feedback as unknown as { memorableInsight?: string })?.memorableInsight && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-indigo-800 text-sm font-medium">
                Key Insight: {(feedback as unknown as { memorableInsight?: string }).memorableInsight}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Feedback Tabs */}
      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="errors">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="errors">
                  Errors ({feedback.errors?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="notes">Examiner Notes</TabsTrigger>
              </TabsList>

              {/* Errors Tab */}
              <TabsContent value="errors" className="space-y-4 mt-4">
                {feedback.errors && feedback.errors.length > 0 ? (
                  feedback.errors.map((error, idx) => {
                    const recurringCount = getRecurringCount(error.text, error.explanation);
                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              categoryColors[error.category] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {error.category}
                          </span>
                          {recurringCount > 1 && (
                            <Badge variant="warning">
                              Recurring — seen {recurringCount}x before
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 line-through">
                              &quot;{error.text}&quot;
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700 font-medium">
                              &quot;{error.correction}&quot;
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 pl-6">
                          {error.explanation}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm">No specific errors flagged.</p>
                )}
              </TabsContent>

              {/* Vocabulary Tab */}
              <TabsContent value="vocabulary" className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {feedback.vocabulary?.overusedWords &&
                    feedback.vocabulary.overusedWords.length > 0 && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2">
                          Overused Words
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.vocabulary.overusedWords.map((word, i) => (
                            <Badge key={i} variant="warning">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {feedback.vocabulary?.sophisticatedUsage &&
                    feedback.vocabulary.sophisticatedUsage.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">
                          Good Vocabulary Use
                        </h4>
                        <ul className="space-y-1">
                          {feedback.vocabulary.sophisticatedUsage.map(
                            (item, i) => (
                              <li key={i} className="text-sm text-green-700">
                                ✓ {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>

                {feedback.vocabulary?.lexicalDiversity && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">
                      Lexical Diversity Assessment
                    </h4>
                    <p className="text-sm text-slate-600">
                      {feedback.vocabulary.lexicalDiversity}
                    </p>
                  </div>
                )}

                {feedback.vocabulary?.suggestions &&
                  feedback.vocabulary.suggestions.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {feedback.vocabulary.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-blue-700">
                            → {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </TabsContent>

              {/* Structure Tab */}
              <TabsContent value="structure" className="space-y-4 mt-4">
                {feedback.structure?.paragraphOrganization && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">
                      Paragraph Organization
                    </h4>
                    <p className="text-sm text-slate-600">
                      {feedback.structure.paragraphOrganization}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {feedback.structure?.cohesiveDevices &&
                    feedback.structure.cohesiveDevices.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">
                          Cohesive Devices Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.structure.cohesiveDevices.map((d, i) => (
                            <Badge key={i} variant="success">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {feedback.structure?.missingElements &&
                    feedback.structure.missingElements.length > 0 && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="text-sm font-semibold text-red-800 mb-2">
                          Missing Elements
                        </h4>
                        <ul className="space-y-1">
                          {feedback.structure.missingElements.map((e, i) => (
                            <li key={i} className="text-sm text-red-700">
                              ✗ {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {feedback.structure?.suggestions &&
                  feedback.structure.suggestions.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {feedback.structure.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-blue-700">
                            → {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </TabsContent>

              {/* Examiner Notes Tab */}
              <TabsContent value="notes" className="mt-4">
                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <AlignLeft className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-800 mb-2">
                      Examiner Notes
                    </h4>
                    <p className="text-sm text-indigo-700 whitespace-pre-line leading-relaxed">
                      {essay.examinerComments}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
