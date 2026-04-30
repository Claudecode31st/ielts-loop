"use client";

import { ScoreChart } from "@/components/score-chart";
import type { ProgressDataPoint } from "@/types";

export function ProgressChart({ data }: { data: ProgressDataPoint[] }) {
  return <ScoreChart data={data} />;
}
