"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import type { StudentMemoryContext } from "@/types";

interface MemoryInsightsProps {
  memory: StudentMemoryContext;
}

export function MemoryInsights({ memory }: MemoryInsightsProps) {
  const { topErrorPatterns, memoryProfile, recentScores } = memory;
  const maxFrequency =
    topErrorPatterns.length > 0
      ? Math.max(...topErrorPatterns.map((e) => e.frequency))
      : 1;

  const categoryColors: Record<string, string> = {
    grammar: "bg-red-100 text-red-700",
    vocabulary: "bg-blue-100 text-blue-700",
    structure: "bg-brand-100 text-brand-700",
    coherence: "bg-orange-100 text-orange-700",
  };

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Recurring Error Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topErrorPatterns.slice(0, 8).map((pattern) => (
              <div key={pattern.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        categoryColors[pattern.errorCategory] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {pattern.errorCategory}
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      {pattern.errorType}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    ×{pattern.frequency}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{
                      width: `${(pattern.frequency / maxFrequency) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {pattern.description}
                </p>
              </div>
            ))}
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
