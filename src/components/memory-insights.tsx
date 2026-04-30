"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { StudentMemoryContext } from "@/types";

interface MemoryInsightsProps {
  memory: StudentMemoryContext;
}

// Category styles
const CAT: Record<string, { badge: string; bar: string; label: string }> = {
  grammar:    { badge: "bg-red-100 text-red-700",    bar: "bg-red-400",    label: "GRA" },
  vocabulary: { badge: "bg-blue-100 text-blue-700",  bar: "bg-blue-400",   label: "LR"  },
  structure:  { badge: "bg-amber-100 text-amber-700",bar: "bg-amber-400",  label: "CC"  },
  coherence:  { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-400", label: "CC" },
};
const FALLBACK_CAT = { badge: "bg-slate-100 text-slate-600", bar: "bg-slate-400", label: "?" };
const getCat = (c: string) => CAT[c] ?? FALLBACK_CAT;

// Absolute bar width: 1 essay=20%, 5+=100%
const absBar = (freq: number) => Math.min(100, Math.max(8, (freq / 5) * 100));

// Severity indicator
function Severity({ freq }: { freq: number }) {
  if (freq >= 5) return <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-red-100 text-red-600">High</span>;
  if (freq >= 3) return <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-amber-100 text-amber-600">Medium</span>;
  if (freq >= 2) return <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-slate-100 text-slate-500">Low</span>;
  return null;
}

export function MemoryInsights({ memory }: MemoryInsightsProps) {
  const { topErrorPatterns, memoryProfile, recentScores } = memory;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const avgBand =
    recentScores.length > 0
      ? (
          recentScores.reduce((s, e) => s + e.overallBand, 0) /
          recentScores.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-4">
      {/* Score Summary */}
      {recentScores.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              Score Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Avg Band", value: avgBand || "-" },
                {
                  label: "Essays",
                  value: String(recentScores.length),
                },
                {
                  label: "Best",
                  value:
                    recentScores.length > 0
                      ? Math.max(
                          ...recentScores.map((e) => e.overallBand)
                        ).toFixed(1)
                      : "-",
                },
                {
                  label: "Latest",
                  value:
                    recentScores.length > 0
                      ? recentScores[0].overallBand.toFixed(1)
                      : "-",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center p-3 bg-slate-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-brand-600">
                    {value}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Errors */}
      {topErrorPatterns.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-3 border-b border-white/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Recurring Error Patterns
              </CardTitle>
              <span className="text-xs text-slate-400 font-medium">
                Bar = how often (1 essay → 20%, 5+ → 100%)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/40">
              {topErrorPatterns.slice(0, 8).map((pattern, idx) => {
                const cat = getCat(pattern.errorCategory);
                const freq = pattern.frequency ?? 1;
                const barW = absBar(freq);
                const isExpanded = expandedId === pattern.id;

                return (
                  <div key={pattern.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <span className="w-5 text-xs font-bold text-slate-300 shrink-0 text-center">
                        {idx + 1}
                      </span>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: name + badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm font-bold text-slate-800 capitalize">
                            {pattern.errorType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-px rounded-full ${cat.badge}`}>
                            {cat.label}
                          </span>
                          <Severity freq={freq} />
                        </div>

                        {/* Row 2: absolute bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cat.bar} transition-all duration-500`}
                              style={{ width: `${barW}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 shrink-0 tabular-nums w-10 text-right">
                            {freq} essay{freq !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : pattern.id)}
                        className="shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title={isExpanded ? "Hide detail" : "Show detail"}
                      >
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                        }
                      </button>
                    </div>

                    {/* Expandable description + example */}
                    {isExpanded && (
                      <div className="mt-2 ml-8 space-y-2">
                        {pattern.description && (
                          <p className="text-xs text-slate-600 leading-relaxed bg-white/60 border border-white/70 rounded-lg px-3 py-2">
                            {pattern.description}
                          </p>
                        )}
                        {pattern.examples && pattern.examples.length > 0 && (
                          <div className="text-xs space-y-1">
                            <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Latest example</p>
                            <p className="line-through text-slate-500">"{pattern.examples[pattern.examples.length - 1].text}"</p>
                            <p className="text-green-700 font-medium">✓ "{pattern.examples[pattern.examples.length - 1].correction}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {memoryProfile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-brand-600" />
              Skill Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {memoryProfile.strengthAreas && memoryProfile.strengthAreas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                  Strengths
                </p>
                <div className="flex flex-wrap gap-2">
                  {memoryProfile.strengthAreas.map((area, i) => (
                    <Badge key={i} variant="success">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {memoryProfile.weaknessAreas && memoryProfile.weaknessAreas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">
                  Areas to Improve
                </p>
                <div className="flex flex-wrap gap-2">
                  {memoryProfile.weaknessAreas.map((area, i) => (
                    <Badge key={i} variant="error">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(!memoryProfile.strengthAreas?.length &&
              !memoryProfile.weaknessAreas?.length) && (
              <p className="text-sm text-slate-500">
                Submit more essays to build your skill profile.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {topErrorPatterns.length === 0 && !memoryProfile && (
        <Card>
          <CardContent className="py-8 text-center">
            <Brain className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              No insights yet. Submit your first essay to start building your
              learning profile.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
