import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import type { DetailedFeedback } from "@/types";
import { AutoPrint, PrintCloseButton } from "./auto-print";

// ── Band helpers ──────────────────────────────────────────────────────────

function bandLabel(score: number) {
  if (score >= 8.5) return "Expert";
  if (score >= 7.5) return "Very Good";
  if (score >= 6.5) return "Competent";
  if (score >= 5.5) return "Modest";
  return "Limited";
}

// ── Error highlighting (plain-text friendly for print) ────────────────────

type ErrorItem = NonNullable<DetailedFeedback["errors"]>[number];
type Seg = { text: string; errorIndex?: number };

function buildSegments(content: string, errors: ErrorItem[]): Seg[] {
  const marks: { start: number; end: number; idx: number }[] = [];
  errors.forEach((error, idx) => {
    if (!error.text || error.text.length < 2) return;
    let pos = content.indexOf(error.text);
    if (pos === -1) pos = content.toLowerCase().indexOf(error.text.toLowerCase());
    if (pos === -1) return;
    const end = pos + error.text.length;
    if (marks.some((m) => pos < m.end && end > m.start)) return;
    marks.push({ start: pos, end, idx });
  });
  marks.sort((a, b) => a.start - b.start);
  const segs: Seg[] = [];
  let cursor = 0;
  for (const m of marks) {
    if (cursor < m.start) segs.push({ text: content.slice(cursor, m.start) });
    segs.push({ text: content.slice(m.start, m.end), errorIndex: m.idx });
    cursor = m.end;
  }
  if (cursor < content.length) segs.push({ text: content.slice(cursor) });
  return segs;
}

const CAT_COLOR: Record<string, string> = {
  grammar:    "#fee2e2", // red-100
  vocabulary: "#dbeafe", // blue-100
  structure:  "#fef3c7", // amber-100
  coherence:  "#ffedd5", // orange-100
};

// ── Page ──────────────────────────────────────────────────────────────────

export default async function EssayPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;
  const [essay] = await db
    .select()
    .from(essays)
    .where(and(eq(essays.id, id), eq(essays.userId, session.user.id)))
    .limit(1);

  if (!essay) notFound();

  const scores = {
    overall:  parseFloat(String(essay.overallBand))      || 0,
    ta:       parseFloat(String(essay.taskAchievement))  || 0,
    cc:       parseFloat(String(essay.coherenceCohesion))|| 0,
    lr:       parseFloat(String(essay.lexicalResource))  || 0,
    gr:       parseFloat(String(essay.grammaticalRange)) || 0,
  };

  const feedback = (essay.detailedFeedback as unknown as DetailedFeedback) ?? {
    errors: [], vocabulary: {}, structure: {},
  };
  const errors: ErrorItem[] = feedback.errors ?? [];
  const vocab   = feedback.vocabulary ?? {};
  const struct  = feedback.structure  ?? {};

  const taskLabel = essay.taskType === "task1" ? "Task 1" : "Task 2";
  const date      = formatDate(essay.submittedAt!);

  const scoreRows = [
    { label: "Task Achievement",      score: scores.ta  },
    { label: "Coherence & Cohesion",  score: scores.cc  },
    { label: "Lexical Resource",      score: scores.lr  },
    { label: "Grammatical Range",     score: scores.gr  },
  ];

  const paragraphs = essay.content.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <AutoPrint />
      <style>{`
        @page { margin: 18mm 16mm; size: A4; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="max-w-[780px] mx-auto px-6 py-8 text-slate-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

        {/* ── Close button (screen only) ── */}
        <PrintCloseButton />

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — Header + Scores + Assessment
        ════════════════════════════════════════════════════════════════ */}

        {/* Report header */}
        <div className="flex items-start justify-between mb-6 pb-5 border-b-2 border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">IELTS Writing Feedback Report</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>{taskLabel}</span>
              <span>·</span>
              <span>{date}</span>
              <span>·</span>
              <span>{essay.wordCount} words</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-slate-900">{scores.overall.toFixed(1)}</div>
            <div className="text-xs text-slate-400 mt-0.5">Overall Band · {bandLabel(scores.overall)}</div>
          </div>
        </div>

        {/* Scores + Examiner side by side */}
        <div className="grid grid-cols-5 gap-6 mb-6 avoid-break">

          {/* Score table */}
          <div className="col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Band Scores</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {scoreRows.map(({ label, score }) => (
                  <tr key={label} className="border-b border-slate-100">
                    <td className="py-2 pr-3 text-slate-600 leading-snug" style={{ fontSize: "12px" }}>{label}</td>
                    <td className="py-2 text-right font-bold tabular-nums" style={{
                      color: score >= 7 ? "#059669" : score >= 6 ? "#d97706" : "#dc2626",
                      fontSize: "14px",
                    }}>
                      {score.toFixed(1)}
                      <span className="ml-1 text-[10px] font-normal text-slate-400">{bandLabel(score)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Examiner Assessment */}
          <div className="col-span-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Examiner&apos;s Assessment</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line" style={{ fontSize: "12px" }}>
              {essay.examinerComments}
            </p>
          </div>
        </div>

        {/* AI Coaching Tip */}
        {essay.feedbackSummary && (
          <div className="avoid-break mb-6 rounded-xl p-4" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <div className="flex items-start gap-3">
              <span style={{ fontSize: "18px" }}>💡</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#1d4ed8" }}>
                  #1 Priority — AI Coaching Tip
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#1e3a8a", fontSize: "12px" }}>
                  {essay.feedbackSummary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — Essay + Annotations
        ════════════════════════════════════════════════════════════════ */}
        <div className="page-break" />

        {/* Task Prompt */}
        <div className="avoid-break mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Task Prompt</h2>
          <div className="rounded-xl p-4 text-sm leading-relaxed text-slate-700" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "12px" }}>
            {essay.prompt}
          </div>
        </div>

        {/* Annotated Essay */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Essay</h2>
            {errors.length > 0 && (
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span><span style={{ background: "#fee2e2", padding: "1px 5px", borderRadius: "3px" }}>■</span> Grammar</span>
                <span><span style={{ background: "#dbeafe", padding: "1px 5px", borderRadius: "3px" }}>■</span> Vocabulary</span>
                <span><span style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: "3px" }}>■</span> Structure</span>
              </div>
            )}
          </div>

          <div className="rounded-xl p-5" style={{ border: "1px solid #e2e8f0", background: "white" }}>
            {paragraphs.map((para, pi) => {
              const segs = buildSegments(para, errors);
              return (
                <p key={pi} className="mb-4 last:mb-0 text-sm leading-8 text-slate-800" style={{ fontSize: "12.5px", lineHeight: "2" }}>
                  {segs.map((seg, si) => {
                    if (seg.errorIndex === undefined) return <span key={si}>{seg.text}</span>;
                    const err = errors[seg.errorIndex];
                    const bg = CAT_COLOR[err.category] ?? "#f1f5f9";
                    return (
                      <span key={si} style={{ background: bg, borderRadius: "2px", padding: "1px 2px" }}>
                        {seg.text}
                        <sup style={{ fontSize: "8px", fontWeight: "bold", color: "#64748b", marginLeft: "1px" }}>
                          {seg.errorIndex + 1}
                        </sup>
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </div>

        {/* Corrections Table */}
        {errors.length > 0 && (
          <div className="avoid-break mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Correction Annotations</h2>
            <table className="w-full text-sm border-collapse" style={{ fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200" style={{ width: "28px" }}>#</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200" style={{ width: "70px" }}>Type</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">Original</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">Correction</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="py-2 px-3 font-bold text-slate-400 align-top">{i + 1}</td>
                    <td className="py-2 px-3 align-top">
                      <span style={{
                        background: CAT_COLOR[err.category] ?? "#f1f5f9",
                        padding: "1px 6px",
                        borderRadius: "9999px",
                        fontSize: "10px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        color: "#334155",
                      }}>
                        {err.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 align-top text-red-700 line-through leading-snug">&ldquo;{err.text}&rdquo;</td>
                    <td className="py-2 px-3 align-top font-semibold leading-snug" style={{ color: "#059669" }}>&ldquo;{err.correction}&rdquo;</td>
                    <td className="py-2 px-3 align-top text-slate-600 leading-relaxed">{err.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — Vocabulary & Structure Analysis
        ════════════════════════════════════════════════════════════════ */}
        {(vocab.overusedWords?.length > 0 || vocab.sophisticatedUsage?.length > 0 || vocab.suggestions?.length > 0 ||
          struct.paragraphOrganization || struct.cohesiveDevices?.length > 0 || struct.suggestions?.length > 0) && (
          <>
            <div className="page-break" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Detailed Analysis</h2>

            <div className="grid grid-cols-2 gap-6">

              {/* Vocabulary */}
              <div className="avoid-break">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span style={{ fontSize: "16px" }}>📚</span> Vocabulary (Lexical Resource)
                </h3>

                {vocab.lexicalDiversity && (
                  <div className="mb-3 p-3 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "11px", color: "#475569", lineHeight: "1.6" }}>
                    {vocab.lexicalDiversity}
                  </div>
                )}

                {vocab.overusedWords?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Overused Words</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vocab.overusedWords.map((w: string, i: number) => (
                        <span key={i} style={{ background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600" }}>
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {vocab.sophisticatedUsage?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Well-Used Phrases ✓</p>
                    <ul className="space-y-1">
                      {vocab.sophisticatedUsage.map((ex: string, i: number) => (
                        <li key={i} style={{ fontSize: "11px", color: "#059669", paddingLeft: "12px", position: "relative" }}>
                          <span style={{ position: "absolute", left: 0 }}>›</span> {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {vocab.suggestions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Suggestions to Improve</p>
                    <ul className="space-y-1">
                      {vocab.suggestions.map((s: string, i: number) => (
                        <li key={i} style={{ fontSize: "11px", color: "#475569", paddingLeft: "12px", position: "relative" }}>
                          <span style={{ position: "absolute", left: 0 }}>·</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Structure */}
              <div className="avoid-break">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span style={{ fontSize: "16px" }}>🏗️</span> Structure (Coherence & Cohesion)
                </h3>

                {struct.paragraphOrganization && (
                  <div className="mb-3 p-3 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "11px", color: "#475569", lineHeight: "1.6" }}>
                    {struct.paragraphOrganization}
                  </div>
                )}

                {struct.cohesiveDevices?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cohesive Devices Used ✓</p>
                    <div className="flex flex-wrap gap-1.5">
                      {struct.cohesiveDevices.map((d: string, i: number) => (
                        <span key={i} style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600" }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {struct.missingElements?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Missing Elements</p>
                    <ul className="space-y-1">
                      {struct.missingElements.map((el: string, i: number) => (
                        <li key={i} style={{ fontSize: "11px", color: "#b45309", paddingLeft: "12px", position: "relative" }}>
                          <span style={{ position: "absolute", left: 0 }}>⚠</span> {el}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {struct.suggestions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Suggestions to Improve</p>
                    <ul className="space-y-1">
                      {struct.suggestions.map((s: string, i: number) => (
                        <li key={i} style={{ fontSize: "11px", color: "#475569", paddingLeft: "12px", position: "relative" }}>
                          <span style={{ position: "absolute", left: 0 }}>·</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-10 pt-5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>Generated by IELTS Memo — ielts-memo.com</span>
          <span>{date} · {taskLabel} · Band {scores.overall.toFixed(1)}</span>
        </div>

      </div>
    </>
  );
}
