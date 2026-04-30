"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProgressDataPoint } from "@/types";

interface ScoreChartProps {
  data: ProgressDataPoint[];
}

const lines = [
  { key: "overallBand", label: "Overall", color: "#4F46E5" },
  { key: "taskAchievement", label: "Task Achievement", color: "#10B981" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion", color: "#F59E0B" },
  { key: "lexicalResource", label: "Lexical Resource", color: "#3B82F6" },
  { key: "grammaticalRange", label: "Grammatical Range", color: "#EF4444" },
];

export function ScoreChart({ data }: ScoreChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-400 text-sm">
          No data yet. Submit essays to see your progress.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
        />
        <YAxis
          domain={[4, 9]}
          ticks={[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }}
          iconType="circle"
          iconSize={8}
        />
        {lines.map(({ key, label, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
