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

function freqBar(freq: number) { return Math.min(100, Math.max(8, (freq / 5) * 100)); }

function FreqLabel({ freq }: { freq: number }) {
  if (freq >= 5) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">High</span>;
  if (freq >= 3) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">Med</span>;
  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">Low</span>;
}

export function ErrorPatterns({ memory }: { memory: StudentMemoryContext }) {
  const { topErrorPatterns, memoryProfile } = memory;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hasErrors = topErrorPatterns.length > 0;
  const hasProfile = !!(memoryProfile?.strengthAreas?.length || memoryProfile?.weaknessAreas?.length);

  if (!hasErrors && !hasProfile) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
        <Brain className="h-9 w-9 text-slate-200 mx-auto" />
        <p className="text-sm text-slate-500">Submit more essays to build your learning profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Recurring Errors ── */}
      {hasErrors && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Recurring Error Patterns</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              1 essay = 20% · 5+ = 100%
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {topErrorPatterns.slice(0, 8).map((pattern, idx) => {
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
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-slate-800 capitalize leading-none">
                            {pattern.errorType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.badge}`}>
                            {pattern.errorCategory}
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
                  ✓ Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {memoryProfile.strengthAreas.map((area, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {memoryProfile?.weaknessAreas && memoryProfile.weaknessAreas.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                  ✗ Focus Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {memoryProfile.weaknessAreas.map((area, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                      {area}
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
