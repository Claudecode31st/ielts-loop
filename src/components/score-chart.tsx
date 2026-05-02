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
  ReferenceLine,
} from "recharts";
import type { ProgressDataPoint } from "@/types";

// 5 hue families — none share a colour family with each other
// Overall = brand red · Task = green · Coherence = blue · Vocabulary = amber · Grammar = purple
const CRITERIA_LINES = [
  { key: "taskAchievement",   label: "Task",       color: "#16A34A" }, // green
  { key: "coherenceCohesion", label: "Coherence",  color: "#2563EB" }, // blue
  { key: "lexicalResource",   label: "Vocabulary", color: "#D97706" }, // amber-orange
  { key: "grammaticalRange",  label: "Grammar",    color: "#9333EA" }, // purple
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // Put Overall first in the tooltip
  const sorted = [...payload].sort((a, b) =>
    a.dataKey === "overallBand" ? -1 : b.dataKey === "overallBand" ? 1 : 0
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1.5 min-w-[190px]">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {sorted.map((p: { name: string; value: number; color: string; dataKey: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: p.color }}
            />
            <span className={p.dataKey === "overallBand" ? "font-semibold text-slate-700" : "text-slate-500"}>
              {p.name}
            </span>
          </div>
          <span className={`tabular-nums ${p.dataKey === "overallBand" ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
            {Number(p.value).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScoreChart({ data }: { data: ProgressDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-400 text-sm">No data yet — submit essays to see your trend.</p>
      </div>
    );
  }

  // Dynamic Y domain with padding
  const allVals = data
    .flatMap((d) => [
      d.overallBand,
      d.taskAchievement,
      d.coherenceCohesion,
      d.lexicalResource,
      d.grammaticalRange,
    ])
    .filter(Boolean);
  const minVal = Math.max(3, Math.floor(Math.min(...allVals) - 0.5));
  const maxVal = Math.min(9, Math.ceil(Math.max(...allVals) + 0.5));

  // Ticks at whole-band intervals only (cleaner with few data points)
  const ticks: number[] = [];
  for (let v = minVal; v <= maxVal; v += 0.5) ticks.push(v);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 6" stroke="#f1f5f9" vertical={false} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[minVal, maxVal]}
          ticks={ticks}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v % 1 === 0 ? v : v.toFixed(1))}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }}
          iconType="circle"
          iconSize={8}
        />

        {/* Subtle band boundary lines */}
        {[4, 5, 6, 7, 8]
          .filter((b) => b >= minVal && b <= maxVal)
          .map((band) => (
            <ReferenceLine
              key={band}
              y={band}
              stroke="#e2e8f0"
              strokeDasharray="3 6"
              label={{
                value: `Band ${band}`,
                position: "insideTopRight",
                fontSize: 9,
                fill: "#cbd5e1",
              }}
            />
          ))}

        {/* Sub-criteria — solid colored lines, slightly thinner than Overall */}
        {CRITERIA_LINES.map(({ key, label, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            connectNulls
          />
        ))}

        {/* Overall band — thicker, brand red, most prominent */}
        <Line
          type="monotone"
          dataKey="overallBand"
          name="Overall"
          stroke="#c7002b"
          strokeWidth={3.5}
          dot={{ r: 6, fill: "#c7002b", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 8, strokeWidth: 0 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
