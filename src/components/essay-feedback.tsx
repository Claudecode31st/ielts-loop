"use client";

import { useState } from "react";
import { BandScoreCard } from "@/components/band-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  BookOpen,
  FileText,
  Lightbulb,
} from "lucide-react";
import type { Essay, ErrorPattern, DetailedFeedback } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

type ErrorItem = NonNullable<DetailedFeedback["errors"]>[number];

type Segment = {
  text: string;
  errorIndex?: number;
};

// ── Annotation helper ──────────────────────────────────────────────────────

function buildSegments(content: string, errors: ErrorItem[]): Segment[] {
  const marks: Array<{ start: number; end: number; errorIdx: number }> = [];

  errors.forEach((error, idx) => {
    if (!error.text || error.text.length < 2) return;
    let pos = content.indexOf(error.text);
    if (pos === -1) pos = content.toLowerCase().indexOf(error.text.toLowerCase());
    if (pos === -1) return;
    const end = pos + error.text.length;
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

// ── Category styles ────────────────────────────────────────────────────────

type CatStyle = {
  badge: string;
  border: string;
  activeBg: string;
};

const CAT: Record<string, CatStyle> = {
  grammar:    { badge: "bg-red-100 text-red-700",    border: "border-b-2 border-red-400",    activeBg: "bg-red-50"    },
  vocabulary: { badge: "bg-blue-100 text-blue-700",  border: "border-b-2 border-blue-400",   activeBg: "bg-blue-50"   },
  structure:  { badge: "bg-amber-100 text-amber-700",border: "border-b-2 border-amber-400",  activeBg: "bg-amber-50"  },
  coherence:  { badge: "bg-orange-100 text-orange-700", border: "border-b-2 border-orange-400", activeBg: "bg-orange-50" },
};
const FALLBACK: CatStyle = { badge: "bg-slate-100 text-slate-700", border: "border-b-2 border-slate-400", activeBg: "bg-slate-50" };
const cs = (cat: string): CatStyle => CAT[cat] ?? FALLBACK;

// ── Component ──────────────────────────────────────────────────────────────

interface EssayFeedbackProps {
  essay: Essay;
  recurringErrors?: ErrorPattern[];
}

export function EssayFeedback({ essay, recurringErrors = [] }: EssayFeedbackProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const feedback = essay.detailedFeedback;
  const scores = {
    overallBand:       parseFloat(String(essay.overallBand)),
    taskAchievement:   parseFloat(String(essay.taskAchievement)),
    coherenceCohesion: parseFloat(String(essay.coherenceCohesion)),
    lexicalResource:   parseFloat(String(essay.lexicalResource)),
    grammaticalRange:  parseFloat(String(essay.grammaticalRange)),
  };

  const errors: ErrorItem[] = feedback?.errors ?? [];
  const segments = buildSegments(essay.content, errors);

  const grammarCount  = errors.filter((e) => e.category === "grammar").length;
  const vocabErrCount = errors.filter((e) => e.category === "vocabulary").length;
  const structErrCount = errors.filter((e) => e.category === "structure" || e.category === "coherence").length;

  // suppress unused-var warning — recurringErrors kept for future use
  void recurringErrors;

  return (
    <div className="space-y-6">

      {/* ══ 1. ANNOTATED ESSAY ══════════════════════════════════════════ */}
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
          <div className="text-sm text-slate-700 leading-8 whitespace-pre-wrap font-normal">
            {segments.map((seg, i) => {
              if (seg.errorIndex === undefined) {
                return <span key={i}>{seg.text}</span>;
              }
              const err = errors[seg.errorIndex];
              const style = cs(err.category);
              const isActive = activeIdx === seg.errorIndex;
              return (
                <span key={i} className="relative group inline">
                  {/* Annotated word */}
                  <button
                    onClick={() => setActiveIdx((prev) => (prev === seg.errorIndex ? null : seg.errorIndex!))}
                    className={`
                      inline cursor-pointer rounded-sm px-0.5
                      ${style.border}
                      ${isActive ? style.activeBg : ""}
                      hover:${style.activeBg}
                      transition-colors duration-150 focus:outline-none
                    `}
                  >
                    {seg.text}
                    <sup className="text-[9px] font-bold text-slate-400 ml-px select-none leading-none">
                      {seg.errorIndex! + 1}
                    </sup>
                  </button>

                  {/* Hover / tap tooltip */}
                  <span
                    className={`
                      pointer-events-none absolute z-50
                      bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2
                      w-72 transition-opacity duration-150
                      ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                  >
                    <span className="block bg-white rounded-xl border border-[var(--border)]
                      shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] p-3 text-left">
                      {/* Category + number */}
                      <span className="flex items-center gap-2 mb-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {err.category}
                        </span>
                        <span className="text-[10px] text-slate-400">Error #{seg.errorIndex! + 1}</span>
                      </span>
                      {/* Error → Correction */}
                      <span className="block space-y-1.5 mb-2.5">
                        <span className="flex items-start gap-1.5">
                          <AlertCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-500 line-through leading-snug">
                            &ldquo;{err.text}&rdquo;
                          </span>
                        </span>
                        <span className="flex items-start gap-1.5">
                          <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-xs font-semibold text-green-700 leading-snug">
                            &ldquo;{err.correction}&rdquo;
                          </span>
                        </span>
                      </span>
                      {/* Explanation */}
                      <span className="block text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                        {err.explanation}
                      </span>
                    </span>
                    {/* Arrow */}
                    <span className="block flex justify-center -mt-px">
                      <span className="block w-0 h-0
                        border-l-[6px] border-l-transparent
                        border-r-[6px] border-r-transparent
                        border-t-[6px] border-t-white" />
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
          {errors.length > 0 && (
            <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
              <span className="font-medium text-slate-500">
                {errors.length} error{errors.length !== 1 ? "s" : ""} marked.
              </span>{" "}
              Hover any underlined text to see the correction.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ══ 2. BAND SCORES + EXAMINER ASSESSMENT — side by side ══════════ */}
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">

        {/* Band Scores */}
        <BandScoreCard scores={scores} className="h-full" />

        {/* Examiner Assessment */}
        <Card variant="glass" className="h-full">
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

      </div>
    </div>
  );
}
