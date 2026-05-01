"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export interface ChartData {
  type: "bar" | "line" | "pie";
  title: string;
  unit: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  categories: string[];
  series: { name: string; data: number[] }[];
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props {
  data: ChartData;
}

export function GeneratedChart({ data }: Props) {
  // ── Pie ───────────────────────────────────────────────────────────────
  if (data.type === "pie") {
    const pieData = data.categories.map((name, i) => ({
      name,
      value: data.series[0]?.data[i] ?? 0,
    }));

    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-600 text-center">{data.title}</p>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}${data.unit}`}
              labelLine={true}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}${data.unit}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Bar / Line: transform to recharts row format ───────────────────────
  const chartRows = data.categories.map((cat, i) => {
    const row: Record<string, string | number> = { category: cat };
    data.series.forEach((s) => { row[s.name] = s.data[i] ?? 0; });
    return row;
  });

  const tickFormatter = (v: number) =>
    data.unit === "%" ? `${v}%` : data.unit.startsWith("$") ? `$${v}` : String(v);

  if (data.type === "bar") {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-600 text-center">{data.title}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartRows} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: "#64748b" }}
              label={data.xAxisLabel ? { value: data.xAxisLabel, position: "insideBottom", offset: -12, fontSize: 11, fill: "#94a3b8" } : undefined}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={tickFormatter}
              label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" } : undefined}
            />
            <Tooltip formatter={(v) => [`${v}${data.unit}`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {data.series.map((s, i) => (
              <Bar key={s.name} dataKey={s.name} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Line ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-600 text-center">{data.title}</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartRows} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: "#64748b" }}
            label={data.xAxisLabel ? { value: data.xAxisLabel, position: "insideBottom", offset: -12, fontSize: 11, fill: "#94a3b8" } : undefined}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={tickFormatter}
            label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" } : undefined}
          />
          <Tooltip formatter={(v) => [`${v}${data.unit}`, ""]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {data.series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
