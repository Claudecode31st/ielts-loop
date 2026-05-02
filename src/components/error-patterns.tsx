"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Brain, CheckCircle2, XCircle } from "lucide-react";
import type { StudentMemoryContext } from "@/types";

const CAT_STYLE: Record<string, { badge: string; bar: string }> = {
  grammar:    { badge: "bg-red-100 text-red-700",     bar: "bg-red-400"    },
  vocabulary: { badge: "bg-blue-100 text-blue-700",   bar: "bg-blue-400"   },
  structure:  { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400"  },
  coherence:  { badge: "bg-violet-100 text-violet-700", bar: "bg-violet-400" },
};
const FALLBACK = { badge: "bg-slate-100 text-slate-600", bar: "bg-slate-400" };
const getCat = (c: string) => CAT_STYLE[c] ?? FALLBACK;

// Plain-English category names — no IELTS jargon
const CAT_LABEL: Record<string, string> = {
  grammar:    "Grammar",
  vocabulary: "Vocabulary",
  structure:  "Structure",
  coherence:  "Coherence",
};
const catLabel = (c: string) => CAT_LABEL[c] ?? c.charAt(0).toUpperCase() + c.slice(1);

// Plain-English skill area names — strip IELTS abbreviations from AI output
function normaliseArea(area: string): string {
  const map: Record<string, string> = {
    "Coherence & Cohesion":           "Coherence",
    "Lexical Resource":               "Vocabulary",
    "Grammatical Range & Accuracy":   "Grammar",
    "Grammatical Range":              "Grammar",
    "Task Achievement":               "Task Achievement",
    "Task Response":                  "Task Response",
  };
  return map[area] ?? area;
}

function freqBar(freq: number) { return Math.min(100, Math.max(8, (freq / 5) * 100)); }

function FreqLabel({ freq }: { freq: number }) {
  if (freq >= 5) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Recurring</span>;
  if (freq >= 3) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">Sometimes</span>;
  if (freq >= 2) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Seen twice</span>;
  return null; // 1× errors are not patterns — don't show a label
}

export function ErrorPatterns({ memory }: { memory: StudentMemoryContext }) {
  const { topErrorPatterns, memoryProfile } = memory;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only show actual patterns — errors seen more than once
  const recurringPatterns = topErrorPatterns.filter((p) => (p.frequency ?? 1) >= 2);

  const hasProfile = !!(memoryProfile?.strengthAreas?.length || memoryProfile?.weaknessAreas?.length);

  if (!recurringPatterns.length && !hasProfile) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
        <Brain className="h-8 w-8 text-slate-200 mx-auto" />
        <p className="text-sm font-medium text-slate-500">No patterns found yet</p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Submit a few more essays and we&apos;ll show you which mistakes keep coming back — those are the ones holding your band score back.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Recurring Errors ── */}
      {recurringPatterns.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">Recurring Mistakes</h2>
            <span className="ml-auto text-xs text-slate-400">Errors you keep making across multiple essays</span>
          </div>

          <div className="divide-y divide-slate-50">
            {recurringPatterns.slice(0, 8).map((pattern, idx) => {
              const cat = getCat(pattern.errorCategory);
              const freq = pattern.frequency ?? 1;
              const isExpanded = expandedId === pattern.id;

              return (
                <div key={pattern.id}>
                  <button
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : pattern.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <span className="shrink-0 w-5 text-xs font-bold text-slate-300 text-center">{idx + 1}</span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800 capitalize leading-none">
                            {pattern.errorType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.badge}`}>
                            {catLabel(pattern.errorCategory)}
                          </span>
                          <FreqLabel freq={freq} />
                        </div>
                        {/* Frequency bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cat.bar} transition-all duration-500`}
                              style={{ width: `${freqBar(freq)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                            {freq}×
                          </span>
                        </div>
                      </div>

                      {/* Toggle */}
                      <span className="shrink-0 text-slate-300">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 ml-8 space-y-2.5">
                      {pattern.description && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                          {pattern.description}
                        </p>
                      )}
                      {pattern.examples && pattern.examples.length > 0 && (() => {
                        const ex = pattern.examples[pattern.examples.length - 1];
                        return (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Example</p>
                            <div className="flex items-start gap-2 text-xs">
                              <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                              <span className="line-through text-slate-500">{ex.text}</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-emerald-700 font-medium">{ex.correction}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-600">No recurring mistakes yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Once the same mistake appears in more than one essay, it will show up here. Keep submitting to find your patterns.
            </p>
          </div>
        </div>
      )}

      {/* ── Skill Profile ── */}
      {hasProfile && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Brain className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-bold text-slate-800">Skill Profile</h2>
          </div>
          <div className="px-5 py-4 grid sm:grid-cols-2 gap-5">
            {memoryProfile?.strengthAreas && memoryProfile.strengthAreas.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
                  Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {memoryProfile.strengthAreas.map((area, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {normaliseArea(area)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {memoryProfile?.weaknessAreas && memoryProfile.weaknessAreas.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                  Needs Practice
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {memoryProfile.weaknessAreas.map((area, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                      {normaliseArea(area)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
