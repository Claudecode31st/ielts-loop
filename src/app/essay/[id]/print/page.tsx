import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { essays } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import type { DetailedFeedback } from "@/types";
import { AutoPrint, PrintCloseButton } from "./auto-print";

// ── Helpers ───────────────────────────────────────────────────────────────

function bandLabel(score: number) {
  if (score >= 8.5) return "Expert";
  if (score >= 7.5) return "Very Good";
  if (score >= 6.5) return "Competent";
  if (score >= 5.5) return "Modest";
  return "Limited";
}

function scoreColor(score: number): string {
  if (score >= 7) return "#059669";   // green
  if (score >= 6) return "#d97706";   // amber
  return "#dc2626";                   // red
}

function scoreBg(score: number): string {
  if (score >= 7) return "#f0fdf4";
  if (score >= 6) return "#fffbeb";
  return "#fef2f2";
}

function scoreBorder(score: number): string {
  if (score >= 7) return "#bbf7d0";
  if (score >= 6) return "#fde68a";
  return "#fecaca";
}

// ── Error highlighting ─────────────────────────────────────────────────────

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
  grammar:    "#fef2f2",
  vocabulary: "#eff6ff",
  structure:  "#fefce8",
  coherence:  "#fff7ed",
};
const CAT_TEXT: Record<string, string> = {
  grammar:    "#b91c1c",
  vocabulary: "#1d4ed8",
  structure:  "#92400e",
  coherence:  "#9a3412",
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
    overall: parseFloat(String(essay.overallBand))       || 0,
    ta:      parseFloat(String(essay.taskAchievement))   || 0,
    cc:      parseFloat(String(essay.coherenceCohesion)) || 0,
    lr:      parseFloat(String(essay.lexicalResource))   || 0,
    gr:      parseFloat(String(essay.grammaticalRange))  || 0,
  };

  const feedback = (essay.detailedFeedback as unknown as DetailedFeedback) ?? {
    errors: [], vocabulary: {}, structure: {},
  };
  const errors: ErrorItem[] = feedback.errors ?? [];
  const vocab  = feedback.vocabulary ?? {};
  const struct = feedback.structure  ?? {};

  const taskLabel  = essay.taskType === "task1" ? "Task 1" : "Task 2";
  const modeLabel  = "Academic"; // could extend if mode is stored
  const date       = formatDate(essay.submittedAt!);
  const paragraphs = essay.content.split(/\n\n+/).filter(Boolean);

  const criteria = [
    { label: "Task Achievement",     abbr: "Task", score: scores.ta },
    { label: "Coherence & Cohesion", abbr: "C&C",  score: scores.cc },
    { label: "Lexical Resource",     abbr: "Lex",  score: scores.lr },
    { label: "Grammatical Range",    abbr: "Gram", score: scores.gr },
  ];

  const hasAnalysis =
    vocab.overusedWords?.length > 0 || vocab.sophisticatedUsage?.length > 0 ||
    vocab.suggestions?.length > 0   || struct.paragraphOrganization ||
    struct.cohesiveDevices?.length > 0 || struct.suggestions?.length > 0;

  return (
    <>
      <AutoPrint />

      {/* ── Global print styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @page { margin: 14mm 12mm; size: A4; }
        @media print {
          html, body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif !important; }
      `}</style>

      <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#0f172a", maxWidth: "780px", margin: "0 auto" }}>

        {/* ── Screen-only toolbar ── */}
        <PrintCloseButton />

        {/* ══════════════════════════════════════════════════════════════
            PAGE 1 — Summary
        ══════════════════════════════════════════════════════════════ */}

        {/* Header bar */}
        <div style={{ background: "#0f172a", borderRadius: "12px", padding: "20px 24px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                IELTS Memo
              </span>
            </div>
            <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.01em" }}>
              Writing Feedback Report
            </h1>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              {taskLabel} · {modeLabel} · {date} · {essay.wordCount} words
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "44px", fontWeight: "800", color: "#f8fafc", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {scores.overall.toFixed(1)}
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", fontWeight: "600" }}>
              OVERALL BAND · {bandLabel(scores.overall).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Criteria cards */}
        <div className="avoid-break" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
          {criteria.map(({ label, abbr, score }) => (
            <div key={abbr} style={{
              background: scoreBg(score),
              border: `1px solid ${scoreBorder(score)}`,
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}>
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {abbr}
              </span>
              <span style={{ fontSize: "24px", fontWeight: "800", color: scoreColor(score), lineHeight: 1, letterSpacing: "-0.02em" }}>
                {score.toFixed(1)}
              </span>
              <span style={{ fontSize: "9px", color: scoreColor(score), fontWeight: "600" }}>
                {bandLabel(score)}
              </span>
              <span style={{ fontSize: "9px", color: "#94a3b8", lineHeight: 1.4, marginTop: "2px" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Examiner + Coaching tip — 2 col */}
        <div className="avoid-break" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>

          {/* Examiner Assessment */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "14px 16px" }}>
            <p style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Examiner&apos;s Assessment
            </p>
            <p style={{ fontSize: "11px", color: "#334155", lineHeight: "1.7", margin: 0 }}>
              {essay.examinerComments}
            </p>
          </div>

          {/* AI Coaching Tip */}
          {essay.feedbackSummary && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "3px solid #2563eb", borderRadius: "0 10px 10px 0", padding: "14px 16px" }}>
              <p style={{ fontSize: "9px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                #1 Priority — AI Coaching Tip
              </p>
              <p style={{ fontSize: "11px", color: "#1e3a8a", lineHeight: "1.7", margin: 0 }}>
                {essay.feedbackSummary}
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PAGE 2 — Essay & Annotations
        ══════════════════════════════════════════════════════════════ */}
        <div className="page-break" />

        {/* Page 2 mini-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Essay &amp; Annotations
          </span>
          <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
            Band {scores.overall.toFixed(1)} · {taskLabel}
          </span>
        </div>

        {/* Task Prompt */}
        <div className="avoid-break" style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            Task Prompt
          </p>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", fontSize: "11px", color: "#475569", lineHeight: "1.7" }}>
            {essay.prompt}
          </div>
        </div>

        {/* Annotated Essay */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <p style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Your Essay
            </p>
            {errors.length > 0 && (
              <div style={{ display: "flex", gap: "10px", fontSize: "9px", color: "#64748b" }}>
                {[
                  { cat: "grammar", label: "Grammar" },
                  { cat: "vocabulary", label: "Vocabulary" },
                  { cat: "structure", label: "Structure" },
                ].map(({ cat, label }) => (
                  <span key={cat} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "2px", background: CAT_COLOR[cat] ?? "#f1f5f9", border: `1px solid ${CAT_TEXT[cat] ?? "#94a3b8"}22` }} />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px 18px", background: "white" }}>
            {paragraphs.map((para, pi) => {
              const segs = buildSegments(para, errors);
              return (
                <p key={pi} style={{ marginBottom: pi < paragraphs.length - 1 ? "12px" : 0, fontSize: "11.5px", lineHeight: "1.9", color: "#1e293b" }}>
                  {segs.map((seg, si) => {
                    if (seg.errorIndex === undefined) return <span key={si}>{seg.text}</span>;
                    const err = errors[seg.errorIndex];
                    const bg = CAT_COLOR[err.category] ?? "#f1f5f9";
                    return (
                      <span key={si} style={{ background: bg, borderRadius: "3px", padding: "0 2px" }}>
                        {seg.text}
                        <sup style={{ fontSize: "7px", fontWeight: "700", color: "#64748b", marginLeft: "1px" }}>
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
          <div className="avoid-break">
            <p style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Correction Annotations
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Type", "Original", "Correction", "Explanation"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "7px 10px",
                      fontSize: "9px", fontWeight: "700", color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      borderBottom: "1px solid #e2e8f0",
                      width: i === 0 ? "24px" : i === 1 ? "72px" : i === 4 ? "36%" : undefined,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {errors.map((err, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "7px 10px", fontWeight: "700", color: "#94a3b8", verticalAlign: "top" }}>{i + 1}</td>
                    <td style={{ padding: "7px 10px", verticalAlign: "top" }}>
                      <span style={{
                        background: CAT_COLOR[err.category] ?? "#f1f5f9",
                        color: CAT_TEXT[err.category] ?? "#334155",
                        padding: "2px 7px", borderRadius: "999px",
                        fontSize: "9px", fontWeight: "700",
                        textTransform: "capitalize", whiteSpace: "nowrap",
                      }}>
                        {err.category}
                      </span>
                    </td>
                    <td style={{ padding: "7px 10px", color: "#dc2626", textDecoration: "line-through", verticalAlign: "top", lineHeight: "1.5" }}>
                      {err.text}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#059669", fontWeight: "600", verticalAlign: "top", lineHeight: "1.5" }}>
                      {err.correction}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#475569", verticalAlign: "top", lineHeight: "1.6" }}>
                      {err.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PAGE 3 — Detailed Analysis (optional)
        ══════════════════════════════════════════════════════════════ */}
        {hasAnalysis && (
          <>
            <div className="page-break" />

            {/* Page 3 mini-header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Detailed Analysis
              </span>
              <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
                Band {scores.overall.toFixed(1)} · {taskLabel}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* Vocabulary */}
              <div className="avoid-break">
                <p style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>📚</span> Vocabulary
                </p>

                {vocab.lexicalDiversity && (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "10.5px", color: "#475569", lineHeight: "1.6", marginBottom: "12px" }}>
                    {vocab.lexicalDiversity}
                  </div>
                )}

                {vocab.overusedWords?.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Overused Words
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {vocab.overusedWords.map((w: string, i: number) => (
                        <span key={i} style={{ background: "#fef2f2", color: "#b91c1c", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: "600", border: "1px solid #fecaca" }}>
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {vocab.sophisticatedUsage?.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Well-Used Phrases ✓
                    </p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {vocab.sophisticatedUsage.map((ex: string, i: number) => (
                        <li key={i} style={{ fontSize: "10.5px", color: "#059669", paddingLeft: "14px", position: "relative", marginBottom: "3px", lineHeight: "1.5" }}>
                          <span style={{ position: "absolute", left: 0 }}>›</span> {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {vocab.suggestions?.length > 0 && (
                  <div>
                    <p style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Suggestions
                    </p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {vocab.suggestions.map((s: string, i: number) => (
                        <li key={i} style={{ fontSize: "10.5px", color: "#475569", paddingLeft: "14px", position: "relative", marginBottom: "3px", lineHeight: "1.5" }}>
                          <span style={{ position: "absolute", left: 0 }}>·</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Structure */}
              <div className="avoid-break">
                <p style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>🏗️</span> Structure
                </p>

                {struct.paragraphOrganization && (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "10.5px", color: "#475569", lineHeight: "1.6", marginBottom: "12px" }}>
                    {struct.paragraphOrganization}
                  </div>
                )}

                {struct.cohesiveDevices?.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Cohesive Devices ✓
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {struct.cohesiveDevices.map((d: string, i: number) => (
                        <span key={i} style={{ background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: "600", border: "1px solid #bbf7d0" }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {struct.missingElements?.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Missing Elements
                    </p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {struct.missingElements.map((el: string, i: number) => (
                        <li key={i} style={{ fontSize: "10.5px", color: "#b45309", paddingLeft: "14px", position: "relative", marginBottom: "3px", lineHeight: "1.5" }}>
                          <span style={{ position: "absolute", left: 0 }}>⚠</span> {el}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {struct.suggestions?.length > 0 && (
                  <div>
                    <p style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Suggestions
                    </p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {struct.suggestions.map((s: string, i: number) => (
                        <li key={i} style={{ fontSize: "10.5px", color: "#475569", paddingLeft: "14px", position: "relative", marginBottom: "3px", lineHeight: "1.5" }}>
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
        <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span style={{ fontWeight: "600" }}>IELTS Memo · ielts-memo.com</span>
          <span>{date} · {taskLabel} · Band {scores.overall.toFixed(1)}</span>
        </div>

      </div>
    </>
  );
}
