"use client";

import { useState } from "react";
import {
  AlertCircle, CheckCircle, BookOpen, FileText,
  Lightbulb, MousePointer, X, CheckCircle2,
} from "lucide-react";
import type { Essay, ErrorPattern, DetailedFeedback } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

type ErrorItem = NonNullable<DetailedFeedback["errors"]>[number];
type Segment   = { text: string; errorIndex?: number };

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

const CAT: Record<string, { base: string; active: string; badge: string; square: string }> = {
  grammar:    { base: "bg-red-100",    active: "bg-red-200",    badge: "bg-red-100 text-red-700",     square: "bg-red-300"    },
  vocabulary: { base: "bg-blue-100",   active: "bg-blue-200",   badge: "bg-blue-100 text-blue-700",   square: "bg-blue-300"   },
  structure:  { base: "bg-amber-100",  active: "bg-amber-200",  badge: "bg-amber-100 text-amber-700", square: "bg-amber-300"  },
  coherence:  { base: "bg-orange-100", active: "bg-orange-200", badge: "bg-orange-100 text-orange-700", square: "bg-orange-300" },
};
const FALLBACK = { base: "bg-slate-100", active: "bg-slate-200", badge: "bg-slate-100 text-slate-700", square: "bg-slate-300" };
const cs = (cat: string) => CAT[cat] ?? FALLBACK;

// ── Component ──────────────────────────────────────────────────────────────

interface EssayFeedbackProps {
  essay: Essay;
  prompt: string;
  recurringErrors?: ErrorPattern[];
}

export function EssayFeedback({ essay, prompt, recurringErrors = [] }: EssayFeedbackProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  void recurringErrors;

  const scores = {
    overallBand:       parseFloat(String(essay.overallBand)),
    taskAchievement:   parseFloat(String(essay.taskAchievement)),
    coherenceCohesion: parseFloat(String(essay.coherenceCohesion)),
    lexicalResource:   parseFloat(String(essay.lexicalResource)),
    grammaticalRange:  parseFloat(String(essay.grammaticalRange)),
  };

  const errors: ErrorItem[] = essay.detailedFeedback?.errors ?? [];
  const segments = buildSegments(essay.content, errors);

  const grammarCount   = errors.filter((e) => e.category === "grammar").length;
  const vocabCount     = errors.filter((e) => e.category === "vocabulary").length;
  const structureCount = errors.filter((e) => e.category === "structure" || e.category === "coherence").length;

  const activeError = activeIdx !== null ? errors[activeIdx] : null;

  const criteriaRows = [
    { abbr: "TA", label: "Task Achievement",         score: scores.taskAchievement   },
    { abbr: "CC", label: "Coherence & Cohesion",     score: scores.coherenceCohesion },
    { abbr: "LR", label: "Lexical Resource",         score: scores.lexicalResource   },
    { abbr: "GR", label: "Grammatical Range",        score: scores.grammaticalRange  },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4 items-start">

      {/* ── Left column ── */}
      <div className="lg:col-span-2 space-y-3">

        {/* Task Prompt */}
        <div className="bg-white border border-[var(--border)] rounded-2xl px-5 py-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Task Prompt</p>
          <p className="text-sm text-slate-700 leading-relaxed">{prompt}</p>
        </div>

        {/* Annotated Essay */}
        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-slate-800">Your Essay</span>
              <span className="text-xs text-slate-400">({essay.wordCount} words)</span>
            </div>
            {errors.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {grammarCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block" />
                    Grammar ({grammarCount})
                  </span>
                )}
                {vocabCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 inline-block" />
                    Vocabulary ({vocabCount})
                  </span>
                )}
                {structureCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-300 inline-block" />
                    Structure ({structureCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Essay text */}
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-8 whitespace-pre-wrap">
              {segments.map((seg, i) => {
                if (seg.errorIndex === undefined) {
                  return <span key={i}>{seg.text}</span>;
                }
                const err      = errors[seg.errorIndex];
                const style    = cs(err.category);
                const isActive = activeIdx === seg.errorIndex;
                return (
                  <span key={i} className="relative inline">
                    <button
                      onClick={() => setActiveIdx((prev) => (prev === seg.errorIndex ? null : seg.errorIndex!))}
                      className={`inline cursor-pointer rounded-sm px-0.5 transition-colors duration-150 focus:outline-none ${
                        isActive ? style.active : style.base
                      }`}
                    >
                      {seg.text}
                      <sup className="text-[9px] font-bold text-slate-400 ml-px select-none leading-none">
                        {seg.errorIndex! + 1}
                      </sup>
                    </button>

                    {/* Mobile-only floating tooltip — hidden on lg+ */}
                    <span className={`lg:hidden pointer-events-none absolute z-50 bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-72 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0"}`}>
                      <span className="block bg-white rounded-xl border border-[var(--border)] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] p-3 text-left">
                        <span className="flex items-center gap-2 mb-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${style.badge}`}>
                            {err.category}
                          </span>
                          <span className="text-[10px] text-slate-400">Error #{seg.errorIndex! + 1}</span>
                        </span>
                        <span className="block space-y-1.5 mb-2.5">
                          <span className="flex items-start gap-1.5">
                            <AlertCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-500 line-through leading-snug">&ldquo;{err.text}&rdquo;</span>
                          </span>
                          <span className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs font-semibold text-emerald-700 leading-snug">&ldquo;{err.correction}&rdquo;</span>
                          </span>
                        </span>
                        <span className="block text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                          {err.explanation}
                        </span>
                      </span>
                      {/* Tooltip arrow */}
                      <span className="flex justify-center -mt-px">
                        <span className="block w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
                      </span>
                    </span>
                  </span>
                );
              })}
            </p>
            {errors.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                <span className="font-medium text-slate-500">{errors.length} error{errors.length !== 1 ? "s" : ""} highlighted.</span>{" "}
                <span className="lg:hidden">Tap any phrase to see the correction.</span>
                <span className="hidden lg:inline">Click any phrase to see the correction →</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right sidebar (sticky) ── */}
      <div className="space-y-3 lg:sticky lg:top-6">

        {/* Band Scores */}
        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Band Scores</span>
            <span className={`text-2xl font-extrabold tabular-nums ${
              scores.overallBand >= 7 ? "text-emerald-600"
              : scores.overallBand >= 6 ? "text-amber-500"
              : "text-red-500"
            }`}>
              {scores.overallBand.toFixed(1)}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {criteriaRows.map(({ abbr, label, score }) => {
              const barColor  = score >= 7 ? "bg-emerald-400" : score >= 6 ? "bg-amber-400" : "bg-red-400";
              const textColor = score >= 7 ? "text-emerald-600" : score >= 6 ? "text-amber-600" : "text-red-500";
              return (
                <div key={abbr}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-5 shrink-0">{abbr}</span>
                      <span className="text-xs text-slate-600">{label}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums shrink-0 ${textColor}`}>{score.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${(score / 9) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error detail panel — desktop only; mobile uses inline tooltip */}
        <div className="hidden lg:block">
        {activeError ? (
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cs(activeError.category).badge}`}>
                  {activeError.category}
                </span>
                <span className="text-xs text-slate-400">Error #{activeIdx! + 1}</span>
              </div>
              <button
                onClick={() => setActiveIdx(null)}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-snug line-through">&ldquo;{activeError.text}&rdquo;</p>
                </div>
                <div className="flex items-start gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-emerald-700 leading-snug">&ldquo;{activeError.correction}&rdquo;</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2.5">
                {activeError.explanation}
              </p>
            </div>
          </div>
        ) : errors.length > 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl p-5 text-center bg-slate-50/50">
            <MousePointer className="h-5 w-5 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any highlighted phrase in the essay to see the correction here
            </p>
          </div>
        ) : null}
        </div>

        {/* Examiner Assessment */}
        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-sm font-semibold text-slate-800">Examiner&apos;s Assessment</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{essay.examinerComments}</p>
            {essay.feedbackSummary && (
              <div className="flex items-start gap-2.5 p-3 bg-brand-50 rounded-xl border border-brand-100">
                <Lightbulb className="h-3.5 w-3.5 text-brand-600 shrink-0 mt-0.5" />
                <p className="text-xs text-brand-800 font-medium leading-relaxed">{essay.feedbackSummary}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
