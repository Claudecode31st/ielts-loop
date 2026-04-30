"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBandBgColor } from "@/lib/utils";
import type { BandScores } from "@/types";

interface BandScoreCardProps {
  scores: BandScores;
  className?: string;
}

const criteria = [
  { key: "taskAchievement" as const, label: "Task Achievement / Response" },
  { key: "coherenceCohesion" as const, label: "Coherence & Cohesion" },
  { key: "lexicalResource" as const, label: "Lexical Resource" },
  { key: "grammaticalRange" as const, label: "Grammatical Range & Accuracy" },
];

function BandPill({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getBandBgColor(score)}`}
    >
      {score.toFixed(1)}
    </span>
  );
}

function BandBar({ score }: { score: number }) {
  const pct = (score / 9) * 100;
  let barColor = "bg-red-400";
  if (score >= 7) barColor = "bg-green-500";
  else if (score >= 6) barColor = "bg-amber-400";

  return (
    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function BandScoreCard({ scores, className }: BandScoreCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Band Score</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-slate-500">Overall</span>
            <span
              className={`text-3xl font-extrabold ${
                scores.overallBand >= 7
                  ? "text-green-600"
                  : scores.overallBand >= 6
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            >
              {scores.overallBand.toFixed(1)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criteria.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">{label}</span>
              <BandPill score={scores[key]} />
            </div>
            <BandBar score={scores[key]} />
          </div>
        ))}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>≥ 7.0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span>6.0 – 6.5</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span>&lt; 6.0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
