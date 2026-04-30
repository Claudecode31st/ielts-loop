"use client";

import { useState } from "react";
import { BandScoreCard } from "@/components/band-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  BookOpen,
  FileText,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import type { Essay, ErrorPattern, DetailedFeedback } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

type ErrorItem = NonNullable<DetailedFeedback["errors"]>[number];

type Segment = {
  text: string;
  errorIndex?: number; // undefined = plain text
};

// ── Annotation helper ──────────────────────────────────────────────────────

function buildSegments(content: string, errors: ErrorItem[]): Segment[] {
  const marks: Array<{ start: number; end: number; errorIdx: number }> = [];

  errors.forEach((error, idx) => {
    if (!error.text || error.text.length < 2) return;
    // Exact match first, then case-insensitive
    let pos = content.indexOf(error.text);
    if (pos === -1) pos = content.toLowerCase().indexOf(error.text.toLowerCase());
    if (pos === -1) return;
    const end = pos + error.text.length;
    // Skip if overlapping an already-claimed region
    if (marks.some((m) => pos < m.end && end > m.start)) return;
    marks.push({ start: pos, end, errorIdx: idx });
  });

  marks.sort((a, b) => a.start - b.start);

  const segs: Segment[] = [];
  let cursor = 0;
  for (const m of marks) {
    if (cursor < m.start) segs.push({ text: content.slice(cursor, m.start) });
    segs.push({ text: content.slice(m.start, m.end), errorIndex: m.errorIdx });
    cursor = m.end;
  }
  if (cursor < content.length) segs.push({ text: content.slice(cursor) });
  return segs;
}

// ── Category styles ─────────────────────────────────────────────────────────

type CatStyle = {
  badge: string;
  border: string;
  activeBg: string;
  dot: string;
  cardActive: string;
  countBadge: string;
};

const CAT: Record<string, CatStyle> = {
  grammar: {
    badge: "bg-red-100 text-red-700",
    border: "border-b-2 border-red-400",
    activeBg: "bg-red-50",
    dot: "bg-red-400",
    cardActive: "border-red-200 bg-red-50/30 ring-1 ring-red-200",
    countBadge: "bg-red-100 text-red-700",
  },
  vocabulary: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-b-2 border-blue-400",
    activeBg: "bg-blue-50",
    dot: "bg-blue-400",
    cardActive: "border-blue-200 bg-blue-50/30 ring-1 ring-blue-200",
    countBadge: "bg-blue-100 text-blue-700",
  },
  structure: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-b-2 border-amber-400",
    activeBg: "bg-amber-50",
    dot: "bg-amber-400",
    cardActive: "border-amber-200 bg-amber-50/30 ring-1 ring-amber-200",
    countBadge: "bg-amber-100 text-amber-700",
  },
  coherence: {
    badge: "bg-orange-100 text-orange-700",
    border: "border-b-2 border-orange-400",
    activeBg: "bg-orange-50",
    dot: "bg-orange-400",
    cardActive: "border-orange-200 bg-orange-50/30 ring-1 ring-orange-200",
    countBadge: "bg-orange-100 text-orange-700",
  },
};
const FALLBACK_CAT: CatStyle = {
  badge: "bg-slate-100 text-slate-700",
  border: "border-b-2 border-slate-400",
  activeBg: "bg-slate-50",
  dot: "bg-slate-400",
  cardActive: "border-slate-200 bg-slate-50/30 ring-1 ring-slate-200",
  countBadge: "bg-slate-100 text-slate-700",
};
const cs = (cat: string): CatStyle => CAT[cat] ?? FALLBACK_CAT;

// ── Component ──────────────────────────────────────────────────────────────

interface EssayFeedbackProps {
  essay: Essay;
  recurringErrors?: ErrorPattern[];
}

export function EssayFeedback({ essay, recurringErrors = [] }: EssayFeedbackProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("errors");

  const feedback = essay.detailedFeedback;
  const scores = {
    overallBand: parseFloat(String(essay.overallBand)),
    taskAchievement: parseFloat(String(essay.taskAchievement)),
    coherenceCohesion: parseFloat(String(essay.coherenceCohesion)),
    lexicalResource: parseFloat(String(essay.lexicalResource)),
    grammaticalRange: parseFloat(String(essay.grammaticalRange)),
  };

  const errors: ErrorItem[] = feedback?.errors ?? [];
  const segments = buildSegments(essay.content, errors);

  // Count per-category for legend
  const grammarCount = errors.filter((e) => e.category === "grammar").length;
  const vocabErrCount = errors.filter((e) => e.category === "vocabulary").length;
  const structErrCount = errors.filter((e) => e.category === "structure" || e.category === "coherence").length;

  // Count for tab labels
  const vocabIssueCount = feedback?.vocabulary?.overusedWords?.length ?? 0;
  const structureIssueCount = feedback?.structure?.missingElements?.length ?? 0;

  function getRecurringCount(explanation: string) {
    return (
      recurringErrors.find(
        (e) =>
          explanation.toLowerCase().includes(e.errorType.toLowerCase()) ||
          e.errorType.toLowerCase().includes(explanation.toLowerCase().slice(0, 20))
      )?.frequency ?? 0
    );
  }

  function onMarkClick(idx: number) {
    const next = activeIdx === idx ? null : idx;
    setActiveIdx(next);
    setActiveTab("errors");
    if (next !== null) {
      setTimeout(() => {
        document
          .getElementById(`ec-${next}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    }
  }

  function onCardClick(idx: number) {
    setActiveIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <div className="space-y-6">
      {/* ══ 1. ANNOTATED ESSAY (first) ══════════════════════════════════ */}
      <Card variant="glass">
        <CardHeader className="pb-3 border-b border-white/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                Your Essay ({essay.wordCount} words)
              </CardTitle>
            </div>
            {/* Category legend */}
            {errors.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {grammarCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    Grammar ({grammarCount})
                  </span>
                )}
                {vocabErrCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                    Vocabulary ({vocabErrCount})
                  </span>
                )}
                {structErrCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    Structure ({structErrCount})
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {/* Essay with inline annotations */}
          <div className="text-sm text-slate-700 leading-8 whitespace-pre-wrap font-normal">
            {segments.map((seg, i) => {
              if (seg.errorIndex === undefined) {
                return <span key={i}>{seg.text}</span>;
              }
              const err = errors[seg.errorIndex];
              const style = cs(err.category);
              const isActive = activeIdx === seg.errorIndex;
              return (
                <button
                  key={i}
                  onClick={() => onMarkClick(seg.errorIndex!)}
                  title={`#${seg.errorIndex! + 1} ${err.category} — click to see correction`}
                  className={`
                    inline cursor-pointer rounded-sm px-0.5
                    ${style.border}
                    ${isActive ? style.activeBg : `hover:${style.activeBg}`}
                    transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400
                  `}
                >
                  {seg.text}
                  <sup className="text-[9px] font-bold text-slate-400 ml-px select-none leading-none">
                    {seg.errorIndex! + 1}
                  </sup>
                </button>
              );
            })}
          </div>
          {errors.length > 0 && (
            <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
              <span className="font-medium text-slate-500">
                {errors.length} error{errors.length !== 1 ? "s" : ""} marked.
              </span>{" "}
              Click any underlined text to jump to the correction below.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ══ 2. BAND SCORES ══════════════════════════════════════════════ */}
      <BandScoreCard scores={scores} />

      {/* ══ 3. EXAMINER ASSESSMENT ══════════════════════════════════════ */}
      <Card variant="glass">
        <CardHeader className="pb-3 border-b border-white/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900">
              Examiner&apos;s Assessment
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {essay.examinerComments}
          </p>
          {essay.feedbackSummary && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl border border-brand-200">
              <Lightbulb className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-sm text-brand-800 font-medium leading-snug">
                {essay.feedbackSummary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══ 4. DETAILED FEEDBACK TABS ═══════════════════════════════════ */}
      {feedback && (
        <Card variant="glass">
          <CardHeader className="pb-3 border-b border-white/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                Detailed Feedback
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1 mb-5">
                {/* Errors tab with count */}
                <TabsTrigger value="errors" className="gap-1.5">
                  Errors
                  {errors.length > 0 && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 rounded-full px-1.5 py-px min-w-[18px] text-center">
                      {errors.length}
                    </span>
                  )}
                </TabsTrigger>
                {/* Vocabulary tab with count */}
                <TabsTrigger value="vocabulary" className="gap-1.5">
                  Vocabulary
                  {vocabIssueCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-px min-w-[18px] text-center">
                      {vocabIssueCount}
                    </span>
                  )}
                </TabsTrigger>
                {/* Structure tab with count */}
                <TabsTrigger value="structure" className="gap-1.5">
                  Structure
                  {structureIssueCount > 0 && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full px-1.5 py-px min-w-[18px] text-center">
                      {structureIssueCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes">Examiner Notes</TabsTrigger>
              </TabsList>

              {/* ── Errors tab ─────────────────────────────────────────── */}
              <TabsContent value="errors" className="space-y-3">
                {errors.length === 0 ? (
                  <div className="py-10 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No errors flagged — great work!</p>
                  </div>
                ) : (
                  errors.map((error, idx) => {
                    const style = cs(error.category);
                    const recurring = getRecurringCount(error.explanation);
                    const isActive = activeIdx === idx;
                    return (
                      <div
                        key={idx}
                        id={`ec-${idx}`}
                        onClick={() => onCardClick(idx)}
                        className={`
                          scroll-mt-6 border rounded-xl p-4 cursor-pointer
                          transition-all duration-200
                          ${
                            isActive
                              ? style.cardActive + " shadow-md"
                              : "border-white/80 bg-white/50 hover:border-brand-200/60 hover:shadow-sm"
                          }
                        `}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.badge}`}
                            >
                              {error.category}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                          </div>
                          {recurring > 1 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              ⚠ Recurring ×{recurring}
                            </span>
                          )}
                        </div>

                        {/* Error → Correction */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 line-through leading-snug">
                              &ldquo;{error.text}&rdquo;
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700 font-semibold leading-snug">
                              &ldquo;{error.correction}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Explanation */}
                        <p className="text-sm text-slate-500 leading-relaxed pl-5 border-l-2 border-slate-200">
                          {error.explanation}
                        </p>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              {/* ── Vocabulary tab ──────────────────────────────────────── */}
              <TabsContent value="vocabulary" className="space-y-4">
                {vocabIssueCount === 0 &&
                  (feedback.vocabulary?.sophisticatedUsage?.length ?? 0) === 0 &&
                  !feedback.vocabulary?.lexicalDiversity &&
                  (feedback.vocabulary?.suggestions?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No vocabulary notes for this essay.
                  </p>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(feedback.vocabulary?.overusedWords?.length ?? 0) > 0 && (
                        <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200">
                          <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Overused Words ({feedback.vocabulary.overusedWords.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {feedback.vocabulary.overusedWords.map((word, i) => (
                              <span
                                key={i}
                                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(feedback.vocabulary?.sophisticatedUsage?.length ?? 0) > 0 && (
                        <div className="p-4 bg-green-50/80 rounded-xl border border-green-200">
                          <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Strong Vocabulary ({feedback.vocabulary.sophisticatedUsage.length})
                          </h4>
                          <ul className="space-y-1">
                            {feedback.vocabulary.sophisticatedUsage.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-green-700 flex items-start gap-1.5"
                              >
                                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {feedback.vocabulary?.lexicalDiversity && (
                      <div className="p-4 bg-white/60 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700 mb-1">
                          Lexical Diversity
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feedback.vocabulary.lexicalDiversity}
                        </p>
                      </div>
                    )}

                    {(feedback.vocabulary?.suggestions?.length ?? 0) > 0 && (
                      <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-800 mb-2">
                          Suggestions ({feedback.vocabulary.suggestions.length})
                        </h4>
                        <ul className="space-y-1.5">
                          {feedback.vocabulary.suggestions.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-blue-700 flex items-start gap-1.5"
                            >
                              <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── Structure tab ───────────────────────────────────────── */}
              <TabsContent value="structure" className="space-y-4">
                {!feedback.structure?.paragraphOrganization &&
                  (feedback.structure?.cohesiveDevices?.length ?? 0) === 0 &&
                  (feedback.structure?.missingElements?.length ?? 0) === 0 &&
                  (feedback.structure?.suggestions?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No structure notes for this essay.
                  </p>
                ) : (
                  <>
                    {feedback.structure?.paragraphOrganization && (
                      <div className="p-4 bg-white/60 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700 mb-1">
                          Paragraph Organisation
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feedback.structure.paragraphOrganization}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {(feedback.structure?.cohesiveDevices?.length ?? 0) > 0 && (
                        <div className="p-4 bg-green-50/80 rounded-xl border border-green-200">
                          <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Cohesive Devices ({feedback.structure.cohesiveDevices.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {feedback.structure.cohesiveDevices.map((d, i) => (
                              <span
                                key={i}
                                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(feedback.structure?.missingElements?.length ?? 0) > 0 && (
                        <div className="p-4 bg-red-50/80 rounded-xl border border-red-200">
                          <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Missing Elements ({feedback.structure.missingElements.length})
                          </h4>
                          <ul className="space-y-1">
                            {feedback.structure.missingElements.map((el, i) => (
                              <li
                                key={i}
                                className="text-sm text-red-700 flex items-start gap-1.5"
                              >
                                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                                {el}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {(feedback.structure?.suggestions?.length ?? 0) > 0 && (
                      <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-800 mb-2">
                          Suggestions ({feedback.structure.suggestions.length})
                        </h4>
                        <ul className="space-y-1.5">
                          {feedback.structure.suggestions.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-blue-700 flex items-start gap-1.5"
                            >
                              <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── Examiner Notes tab ──────────────────────────────────── */}
              <TabsContent value="notes">
                <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-brand-50 to-brand-100/40 rounded-xl border border-brand-200">
                  <BookOpen className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-brand-800 mb-2">
                      Full Examiner Notes
                    </h4>
                    <p className="text-sm text-brand-700 whitespace-pre-line leading-relaxed">
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
