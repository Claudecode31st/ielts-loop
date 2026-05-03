import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, essays, exercises } from "@/lib/db/schema";
import { desc, gte, count, eq, countDistinct, sql, isNotNull } from "drizzle-orm";
import { Users, FileText, Zap, Activity, TrendingUp, TrendingDown, Minus, BookOpen, DollarSign } from "lucide-react";

// ── Claude API cost estimates ─────────────────────────────────────────────────
// Prices: sonnet-4-6 $3/$15 per MTok in/out · haiku-4-5 $0.80/$4 per MTok in/out
// Avg tokens estimated from actual prompt sizes in src/lib/claude.ts
const COST_PER_ESSAY     = (3200 * 3.00 + 1600 * 15.00) / 1_000_000; // ~$0.034
const COST_PER_EX_BATCH  = (2400 * 0.80 + 1100 *  4.00) / 1_000_000; // ~$0.006  (3 exercises)
const COST_PER_PROMPT    = ( 500 * 0.80 +  350 *  4.00) / 1_000_000; // ~$0.002
const COST_PER_GUIDE     = (2200 * 0.80 +  850 *  4.00) / 1_000_000; // ~$0.005
const COST_PER_SAMPLE    = ( 500 * 3.00 +  600 * 15.00) / 1_000_000; // ~$0.0105 (sonnet, cached after 1st gen)

function fmtCost(n: number) {
  if (n >= 1)   return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

// ── Auth guard ────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin");
  if (session.user.email !== process.env.ADMIN_EMAIL) redirect("/dashboard");
  return session;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number | string) { return Number(n).toLocaleString(); }
function pct(n: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}
function ago(date: Date | null | string) {
  if (!date) return "—";
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function startOf(unit: "day" | "week" | "month") {
  const d = new Date();
  if (unit === "day")   { d.setHours(0, 0, 0, 0); return d; }
  if (unit === "week")  { d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; }
  d.setDate(1); d.setHours(0, 0, 0, 0); return d;
}

function prevMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  await requireAdmin();

  const now = new Date();
  const monthStart = startOf("month");
  const weekStart  = startOf("week");
  const { start: prevStart, end: prevEnd } = prevMonthRange();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Run all queries in parallel
  const [
    [{ total: totalUsers }],
    [{ total: usersThisMonth }],
    [{ total: usersPrevMonth }],
    [{ total: proUsers }],
    [{ total: totalEssays }],
    [{ total: essaysThisMonth }],
    [{ total: essaysPrevMonth }],
    [{ total: totalExercises }],
    [{ total: activeThisWeek }],
    recentUsers,
    recentEssays,
    dailySignups,
    exercisesByUser,
    monthlyEssays,
    monthlyExercises,
    essaysThisMonthByUser,
    [{ total: totalSamples }],
    monthlySamplesRaw,
    samplesByUser,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(users).where(gte(users.createdAt, monthStart)),
    db.select({ total: count() }).from(users).where(
      sql`${users.createdAt} >= ${prevStart} AND ${users.createdAt} < ${prevEnd}`
    ),
    db.select({ total: count() }).from(users).where(eq(users.plan, "pro")),
    db.select({ total: count() }).from(essays),
    db.select({ total: count() }).from(essays).where(gte(essays.submittedAt, monthStart)),
    db.select({ total: count() }).from(essays).where(
      sql`${essays.submittedAt} >= ${prevStart} AND ${essays.submittedAt} < ${prevEnd}`
    ),
    db.select({ total: count() }).from(exercises),
    db.select({ total: countDistinct(essays.userId) }).from(essays).where(gte(essays.submittedAt, weekStart)),
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      totalEssays: users.totalEssays,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(25),
    db.select({
      id: essays.id,
      userId: essays.userId,
      taskType: essays.taskType,
      overallBand: essays.overallBand,
      submittedAt: essays.submittedAt,
    }).from(essays).orderBy(desc(essays.submittedAt)).limit(10),
    // Daily signups last 14 days
    db.select({
      day: sql<string>`DATE(${users.createdAt})`.as("day"),
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, new Date(Date.now() - 14 * 86400_000)))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`),
    // Exercise count per user (for cost estimate per user)
    db.select({ userId: exercises.userId, exCount: count() })
      .from(exercises)
      .groupBy(exercises.userId),
    // Monthly essay counts — last 6 months
    db.select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${essays.submittedAt}), 'YYYY-MM')`.as("month"),
      cnt: count(),
    })
    .from(essays)
    .where(gte(essays.submittedAt, sixMonthsAgo))
    .groupBy(sql`DATE_TRUNC('month', ${essays.submittedAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${essays.submittedAt})`),
    // Monthly exercise counts — last 6 months
    db.select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${exercises.generatedAt}), 'YYYY-MM')`.as("month"),
      cnt: count(),
    })
    .from(exercises)
    .where(gte(exercises.generatedAt, sixMonthsAgo))
    .groupBy(sql`DATE_TRUNC('month', ${exercises.generatedAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${exercises.generatedAt})`),
    // Essays submitted this month, per user
    db.select({ userId: essays.userId, cnt: count() })
      .from(essays)
      .where(gte(essays.submittedAt, monthStart))
      .groupBy(essays.userId),
    // Total model answers generated (cached after first gen)
    db.select({ total: count() })
      .from(essays)
      .where(isNotNull(essays.sampleEssay)),
    // Monthly model answer counts — last 6 months
    db.select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${essays.submittedAt}), 'YYYY-MM')`.as("month"),
      cnt: count(),
    })
    .from(essays)
    .where(sql`${essays.sampleEssay} IS NOT NULL AND ${essays.submittedAt} >= ${sixMonthsAgo}`)
    .groupBy(sql`DATE_TRUNC('month', ${essays.submittedAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${essays.submittedAt})`),
    // Sample count per user (all-time)
    db.select({ userId: essays.userId, cnt: count() })
      .from(essays)
      .where(isNotNull(essays.sampleEssay))
      .groupBy(essays.userId),
  ]);

  // Build a full 14-day map for the chart
  const signupMap = new Map(dailySignups.map((r) => [r.day, Number(r.count)]));
  const chartDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400_000);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), value: signupMap.get(key) ?? 0 };
  });
  const chartMax = Math.max(...chartDays.map((d) => d.value), 1);

  const tu = Number(totalUsers);
  const tum = Number(usersThisMonth);
  const tup = Number(usersPrevMonth);
  const pro = Number(proUsers);
  const te  = Number(totalEssays);
  const tem = Number(essaysThisMonth);
  const tep = Number(essaysPrevMonth);
  const aw  = Number(activeThisWeek);
  const tex = Number(totalExercises);

  // ── Cost estimates ────────────────────────────────────────────────────────
  const exBatchesTotal = Math.floor(tex / 3);
  const tsa            = Number(totalSamples);
  const costEssays     = te  * COST_PER_ESSAY;
  const costExercises  = exBatchesTotal * COST_PER_EX_BATCH;
  // Prompt & guide costs estimated from essay volume (no global counter available)
  const costPrompts    = te  * 0.4  * COST_PER_PROMPT;  // ~40% of essays used a generated prompt
  const costGuide      = te  * 1.5  * COST_PER_GUIDE;   // ~1.5 guide calls per essay on average
  const costSamples    = tsa * COST_PER_SAMPLE;          // only first generation costs
  const costTotal      = costEssays + costExercises + costPrompts + costGuide + costSamples;

  // Build lookup: userId → sample count (all-time)
  const samplesByUserMap = new Map(samplesByUser.map((r) => [r.userId, Number(r.cnt)]));

  // Build monthly sample map
  const mSamplesMap = new Map(monthlySamplesRaw.map((r) => [r.month, Number(r.cnt)]));

  // Build lookup: userId → exercise count (all-time)
  const exByUser = new Map(exercisesByUser.map((r) => [r.userId, Number(r.exCount)]));

  // Build lookup: userId → essays this month
  const essaysThisMonthMap = new Map(essaysThisMonthByUser.map((r) => [r.userId, Number(r.cnt)]));

  // Build 6-month cost trend
  const mEssaysMap = new Map(monthlyEssays.map((r) => [r.month, Number(r.cnt)]));
  const mExMap     = new Map(monthlyExercises.map((r) => [r.month, Number(r.cnt)]));
  const monthlyCost = Array.from({ length: 6 }, (_, i) => {
    const d      = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key    = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label  = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
    const eCnt    = mEssaysMap.get(key) ?? 0;
    const exBatch = Math.floor((mExMap.get(key) ?? 0) / 3);
    const sCnt    = mSamplesMap.get(key) ?? 0;
    const cost    = eCnt * COST_PER_ESSAY + exBatch * COST_PER_EX_BATCH
                  + eCnt * 0.4 * COST_PER_PROMPT + eCnt * 1.5 * COST_PER_GUIDE
                  + sCnt * COST_PER_SAMPLE;
    return { key, label, eCnt, exBatch, sCnt, cost };
  });
  const costChartMax = Math.max(...monthlyCost.map((m) => m.cost), 0.01);

  function delta(curr: number, prev: number) {
    if (!prev) return null;
    const d = curr - prev;
    return { d, up: d >= 0 };
  }

  const userDelta  = delta(tum, tup);
  const essayDelta = delta(tem, tep);

  const statCards = [
    {
      label: "Total Users",
      value: fmt(tu),
      sub: `${fmt(tum)} this month`,
      delta: userDelta,
      icon: Users,
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "Total Essays",
      value: fmt(te),
      sub: `${fmt(tem)} this month`,
      delta: essayDelta,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pro Subscribers",
      value: fmt(pro),
      sub: `${pct(pro, tu)} of users`,
      delta: null,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active This Week",
      value: fmt(aw),
      sub: "users who submitted an essay",
      delta: null,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Exercises Generated",
      value: fmt(tex),
      sub: "total across all users",
      delta: null,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Est. API Cost",
      value: fmtCost(costTotal),
      sub: "all-time Claude API spend",
      delta: null,
      icon: DollarSign,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Owner</p>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Live data · Last refreshed {now.toLocaleString()}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(({ label, value, sub, delta, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
              <div className="flex items-center gap-1">
                {delta ? (
                  delta.up ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
                  )
                ) : (
                  <Minus className="h-3 w-3 text-slate-300 shrink-0" />
                )}
                <span className="text-[11px] text-slate-400">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Signups chart + Recent essays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Daily signups chart — takes 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-1">New Signups — Last 14 Days</h2>
            <p className="text-xs text-slate-400 mb-5">
              Total this period: <span className="font-semibold text-slate-600">{chartDays.reduce((s, d) => s + d.value, 0)}</span>
            </p>
            <div className="flex items-end gap-1.5 h-32">
              {chartDays.map((d) => (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div
                      className="w-full bg-brand-500 rounded-t-sm transition-all duration-300 group-hover:bg-brand-600"
                      style={{ height: `${Math.max(2, (d.value / chartMax) * 100)}px` }}
                    />
                    {d.value > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.value}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-300 whitespace-nowrap rotate-45 origin-left translate-x-1">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent essays */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Recent Essays</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentEssays.map((e) => (
                <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {e.taskType === "task1" ? "Task 1" : "Task 2"}
                    </p>
                    <p className="text-[10px] text-slate-400">{ago(e.submittedAt)}</p>
                  </div>
                  {e.overallBand && (
                    <span className="shrink-0 text-sm font-bold text-slate-800 tabular-nums">
                      {Number(e.overallBand).toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly cost trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-800">Monthly API Cost — Last 6 Months</h2>
            <span className="text-xs text-slate-400">
              This month: <span className="font-semibold text-rose-500">{fmtCost(monthlyCost[5]?.cost ?? 0)}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-5">Essays + exercises + estimated prompt &amp; guide spend</p>
          <div className="flex items-end gap-3 h-36">
            {monthlyCost.map((m, i) => {
              const isCurrentMonth = i === 5;
              const pct = Math.max(2, (m.cost / costChartMax) * 100);
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex items-end justify-center" style={{ height: "110px" }}>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${isCurrentMonth ? "bg-rose-500 group-hover:bg-rose-600" : "bg-rose-200 group-hover:bg-rose-300"}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {fmtCost(m.cost)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-semibold ${isCurrentMonth ? "text-slate-600" : "text-slate-400"}`}>{m.label}</p>
                    <p className="text-[9px] text-slate-300 tabular-nums">{m.eCnt} essays</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Cost Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-800">Estimated API Cost Breakdown</h2>
            <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
              Estimates · avg token counts per operation
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-slate-100">
            {[
              { label: "Essay Analysis",    model: "Sonnet 4-6", cost: costEssays,    count: te,            unit: "essays",       perUnit: COST_PER_ESSAY,    color: "text-blue-600" },
              { label: "Exercise Gen",      model: "Haiku 4-5",  cost: costExercises, count: exBatchesTotal, unit: "batches",      perUnit: COST_PER_EX_BATCH, color: "text-purple-600" },
              { label: "Prompt Gen",        model: "Haiku 4-5",  cost: costPrompts,   count: Math.round(te * 0.4), unit: "est. calls", perUnit: COST_PER_PROMPT,  color: "text-amber-600" },
              { label: "Guide Mode",        model: "Haiku 4-5",  cost: costGuide,     count: Math.round(te * 1.5), unit: "est. calls", perUnit: COST_PER_GUIDE,   color: "text-emerald-600" },
              { label: "Model Answers",     model: "Sonnet 4-5", cost: costSamples,   count: tsa,           unit: "generated",    perUnit: COST_PER_SAMPLE,   color: "text-rose-600" },
            ].map(({ label, model, cost, count: c, unit, perUnit, color }) => (
              <div key={label} className="px-5 py-4 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-xl font-bold tabular-nums ${color}`}>{fmtCost(cost)}</p>
                <p className="text-[11px] text-slate-500">{fmt(c)} {unit}</p>
                <p className="text-[10px] text-slate-400">{fmtCost(perUnit)}/call · {model}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Prompt & Guide costs are estimated (~40% prompts generated, ~1.5 guide calls/essay avg).
              Model Answers counted exactly — cached after first generation, no repeat cost.
            </p>
            <p className="text-sm font-bold text-slate-800 tabular-nums shrink-0 ml-4">
              Total: <span className="text-rose-600">{fmtCost(costTotal)}</span>
            </p>
          </div>
        </div>

        {/* Recent users table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Sign-ups</h2>
            <span className="text-xs text-slate-400">Latest {recentUsers.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["User", "Email", "Plan", "Essays", "This Month", "Est. Cost", "Joined"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentUsers.map((u) => {
                  const initials = u.name
                    ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : (u.email?.[0] ?? "?").toUpperCase();
                  const uEssays       = Number(u.totalEssays ?? 0);
                  const uExBatch      = Math.floor((exByUser.get(u.id) ?? 0) / 3);
                  const uSamples      = samplesByUserMap.get(u.id) ?? 0;
                  const uCost         = uEssays * COST_PER_ESSAY + uExBatch * COST_PER_EX_BATCH + uSamples * COST_PER_SAMPLE;
                  const uThisMonth    = essaysThisMonthMap.get(u.id) ?? 0;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-brand-600">{initials}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-800 max-w-[120px] truncate">
                            {u.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 max-w-[180px] truncate">{u.email}</td>
                      <td className="px-5 py-3">
                        {u.plan === "pro" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                            <Zap className="h-2.5 w-2.5" /> Pro
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 tabular-nums">
                        {uEssays}
                      </td>
                      <td className="px-5 py-3 text-xs tabular-nums">
                        {uThisMonth > 0
                          ? <span className="font-semibold text-brand-600">{uThisMonth}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs tabular-nums font-medium text-rose-500">
                        {uCost > 0 ? fmtCost(uCost) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
