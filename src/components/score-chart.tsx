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

const CRITERIA_LINES = [
  { key: "taskAchievement",   label: "Task Achievement",     color: "#10B981", dash: "4 2" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion", color: "#6366F1", dash: "4 2" },
  { key: "lexicalResource",   label: "Lexical Resource",     color: "#8B5CF6", dash: "4 2" },
  { key: "grammaticalRange",  label: "Grammar",              color: "#F59E0B", dash: "4 2" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1.5 min-w-[180px]">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-slate-500">{p.name}</span>
          </div>
          <span className="font-bold text-slate-800 tabular-nums">{Number(p.value).toFixed(1)}</span>
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

  // Dynamic Y domain with some padding
  const allVals = data.flatMap((d) => [d.overallBand, d.taskAchievement, d.coherenceCohesion, d.lexicalResource, d.grammaticalRange]).filter(Boolean);
  const minVal = Math.max(3, Math.floor(Math.min(...allVals) - 0.5));
  const maxVal = Math.min(9, Math.ceil(Math.max(...allVals) + 0.5));

  // Generate ticks at 0.5 intervals
  const ticks: number[] = [];
  for (let v = minVal; v <= maxVal; v += 0.5) ticks.push(v);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" vertical={false} />
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
          tickFormatter={(v) => v % 1 === 0 ? v : v.toFixed(1)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "14px" }}
          iconType="circle"
          iconSize={7}
        />

        {/* Band boundary reference lines */}
        {[5, 6, 7, 8].filter((b) => b > minVal && b < maxVal).map((band) => (
          <ReferenceLine
            key={band}
            y={band}
            stroke="#e2e8f0"
            strokeDasharray="2 6"
            label={{ value: `Band ${band}`, position: "insideTopRight", fontSize: 9, fill: "#cbd5e1" }}
          />
        ))}

        {/* Sub-criteria — thin dashed, dimmed */}
        {CRITERIA_LINES.map(({ key, label, color, dash }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray={dash}
            strokeOpacity={0.6}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}

        {/* Overall band — bold, prominent */}
        <Line
          type="monotone"
          dataKey="overallBand"
          name="Overall"
          stroke="#2563EB"
          strokeWidth={3}
          dot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 7, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
