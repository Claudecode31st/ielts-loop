"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Loader2, Brain, Target, BarChart3,
  Check, X, CheckCircle2, AlertCircle,
} from "lucide-react";

// ── Shared helpers ────────────────────────────────────────────────────────────

function bandColor(s: number) {
  return s >= 7 ? "text-green-600" : s >= 6 ? "text-amber-500" : "text-red-500";
}

// ── Guide Mode Demo ───────────────────────────────────────────────────────────

const GUIDE_TEXT =
  "The chart illustrates the proportion of households in the UK from 1990 to 2020. Middle-income groups climbed from 35% to 52%, while low-income households declined steadily from 45% to 28% over the period.";

const GUIDE_SUGGESTIONS = [
  {
    label: "Vocabulary",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    excerpt: "climbed from 35% to 52%",
    tip: "Great verb. Try 'surged' or 'jumped' elsewhere for variety.",
  },
  {
    label: "Cohesion",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    excerpt: "declined steadily",
    tip: "Add a supporting figure or comparison to strengthen this point.",
  },
  {
    label: "Grammar",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    excerpt: "chart illustrates",
    tip: "'depicts' or 'presents' reads as more academic for IELTS Task 1.",
  },
];

function GuideModeDemo() {
  const [text, setText] = useState("");
  const [scores, setScores] = useState(false);
  const [sugs, setSugs] = useState(0);
  const [typing, setTyping] = useState(true);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setText("");
    setScores(false);
    setSugs(0);
    setTyping(true);

    let t: ReturnType<typeof setTimeout>;
    function tick() {
      if (idx.current < GUIDE_TEXT.length) {
        idx.current++;
        setText(GUIDE_TEXT.slice(0, idx.current));
        t = setTimeout(tick, 22);
      } else {
        setTyping(false);
        setTimeout(() => setScores(true), 700);
        setTimeout(() => setSugs(1), 1300);
        setTimeout(() => setSugs(2), 1900);
        setTimeout(() => setSugs(3), 2500);
        // Loop: restart after pause
        setTimeout(() => {
          idx.current = 0;
          setText("");
          setScores(false);
          setSugs(0);
          setTyping(true);
          t = setTimeout(tick, 400);
        }, 6000);
      }
    }
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, []);

  const sc = { task: 6.5, cc: 6.0, lex: 6.5, gram: 6.5, overall: 6.5 };

  return (
    <div className="flex gap-3 min-h-[300px]">
      {/* Textarea mockup */}
      <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700 leading-relaxed overflow-hidden">
        {text}
        {typing && <span className="animate-pulse text-brand-600 font-bold ml-px">|</span>}
      </div>

      {/* Guide panel */}
      <div className="w-44 shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
          <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-slate-700">AI Tutor</span>
          {typing && <Loader2 className="h-3 w-3 animate-spin text-brand-500 ml-auto" />}
        </div>

        {scores && (
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Live Band</span>
              <span className="text-sm font-extrabold text-amber-500">{sc.overall.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-4 gap-0.5">
              {([ ["Task", sc.task], ["CC", sc.cc], ["Lex", sc.lex], ["Gram", sc.gram] ] as [string,number][]).map(([lbl, val]) => (
                <div key={lbl} className="flex flex-col items-center bg-white/70 rounded py-1">
                  <span className={`text-[10px] font-bold ${bandColor(val)}`}>{val.toFixed(1)}</span>
                  <span className="text-[8px] text-slate-400">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {GUIDE_SUGGESTIONS.slice(0, sugs).map((s, i) => (
          <div key={i} className={`rounded-lg border p-2 ${s.bg} ${s.border}`}>
            <div className={`text-[8px] font-bold uppercase tracking-wide ${s.color} mb-0.5`}>{s.label}</div>
            <p className="text-[9px] italic text-slate-400 mb-0.5 truncate">"{s.excerpt}"</p>
            <p className="text-[9px] text-slate-600 leading-relaxed line-clamp-2">{s.tip}</p>
          </div>
        ))}

        {!scores && (
          <p className="text-[9px] text-slate-400 text-center mt-2 leading-relaxed">
            Feedback appears<br />as you write…
          </p>
        )}
      </div>
    </div>
  );
}

// ── Essay Feedback Demo ───────────────────────────────────────────────────────

function EssayFeedbackDemo() {
  return (
    <div className="space-y-3 min-h-[300px]">
      {/* Band scores */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
        <div className="text-center shrink-0">
          <div className="text-3xl font-bold text-amber-500 tabular-nums">6.5</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Overall Band</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {([
            { code: "TA",  score: 6.5, bar: "bg-emerald-400" },
            { code: "CC",  score: 6.0, bar: "bg-blue-400" },
            { code: "LR",  score: 6.5, bar: "bg-amber-400" },
            { code: "GRA", score: 6.5, bar: "bg-red-400" },
          ]).map(({ code, score, bar }) => (
            <div key={code} className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 w-7 shrink-0">{code}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`${bar} h-full rounded-full`} style={{ width: `${(score / 9) * 100}%` }} />
              </div>
              <span className="text-[11px] font-bold text-slate-600 w-7 text-right tabular-nums">{score.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500 shrink-0 self-start">Task 1</span>
      </div>

      {/* Annotated essay */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Your Essay · Inline Annotations</div>
        <p className="text-xs text-slate-700 leading-relaxed">
          The chart{" "}
          <span className="bg-amber-100 text-amber-900 rounded px-0.5 underline decoration-dotted cursor-help" title="💡 Try 'depicts' — more academic">illustrates</span>
          {" "}the proportion of households in{" "}
          <span className="bg-red-100 text-red-900 rounded px-0.5 underline decoration-dotted cursor-help" title="❌ Missing article — should be 'the UK'">UK</span>
          {" "}from 1990 to 2020. Middle-income households{" "}
          <span className="bg-green-100 text-green-900 rounded px-0.5 underline decoration-dotted cursor-help" title="✅ Strong academic verb choice">climbed significantly</span>
          , while low-income groups{" "}
          <span className="bg-amber-100 text-amber-900 rounded px-0.5 underline decoration-dotted cursor-help" title="💡 'declined steadily' is more precise">went down</span>
          {" "}over the period.
        </p>
        <p className="text-[9px] text-slate-400 mt-2">Hover annotations to see feedback</p>
      </div>

      {/* Score blockers + memory */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Score Blockers</div>
          {[
            { name: "Article errors",   badge: "High",   color: "bg-red-50 text-red-600" },
            { name: "Informal verbs",   badge: "Medium", color: "bg-amber-50 text-amber-600" },
            { name: "Missing overview", badge: "Medium", color: "bg-amber-50 text-amber-600" },
          ].map(({ name, badge, color }) => (
            <div key={name} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-[10px] text-slate-600">{name}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-px rounded ${color}`}>{badge}</span>
            </div>
          ))}
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-brand-600 shrink-0" />
            <span className="text-[10px] font-bold text-brand-700">Memory Insight</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Article errors in <span className="font-bold text-brand-600">7 of 9</span> essays — your <span className="font-bold text-brand-700">#1 band limiter.</span>
          </p>
          <div className="mt-auto pt-1 border-t border-brand-100">
            <p className="text-[9px] text-brand-500">Adaptive exercise generated ↓</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Adaptive Exercise Demo ────────────────────────────────────────────────────

const EX = {
  options: ["has risen", "have risen", "rose", "is rising"],
  correct: 0,
  explanation: "Use present perfect ('has risen') for a trend that started in the past and continues now — a common IELTS Task 1 pattern.",
};

function ExerciseDemo() {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function pick(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  }

  return (
    <div className="min-h-[300px] flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
            <Target className="h-3.5 w-3.5 text-brand-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">Grammar · Present Perfect</p>
            <p className="text-[10px] text-slate-400">Generated from your error history</p>
          </div>
          <span className="ml-auto text-[9px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">Repeat mistake ×7</span>
        </div>

        {/* Sentence */}
        <p className="text-sm text-slate-800 leading-relaxed mb-5 font-medium">
          Since 2010, the number of electric vehicles on UK roads{" "}
          <span className="inline-block min-w-[90px] border-b-2 border-brand-400 text-center text-brand-600 font-bold px-1">
            {revealed ? EX.options[EX.correct] : "      "}
          </span>
          {" "}dramatically.
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {EX.options.map((opt, i) => {
            const isCorrect = i === EX.correct;
            const isSelected = i === selected;
            let cls = "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 cursor-pointer";
            if (revealed && isCorrect) cls = "border-green-300 bg-green-50 text-green-700 font-semibold cursor-default";
            else if (revealed && isSelected && !isCorrect) cls = "border-red-300 bg-red-50 text-red-600 line-through cursor-default";
            else if (revealed) cls = "border-slate-100 bg-slate-50 text-slate-400 cursor-default";

            return (
              <button key={i} onClick={() => pick(i)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${cls}`}>
                <span>{opt}</span>
                {revealed && isCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                {revealed && isSelected && !isCorrect && <X className="h-4 w-4 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {!revealed && (
          <p className="text-[10px] text-slate-400 text-center mt-3">Click the correct option to check your answer</p>
        )}
      </div>

      {revealed && (
        <div className={`rounded-xl border p-4 ${selected === EX.correct ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-start gap-2">
            {selected === EX.correct
              ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-xs font-semibold mb-1 ${selected === EX.correct ? "text-green-700" : "text-amber-700"}`}>
                {selected === EX.correct ? "Correct! Well done." : `Correct answer: "${EX.options[EX.correct]}"`}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">{EX.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {revealed && (
        <button onClick={() => { setSelected(null); setRevealed(false); }}
          className="text-xs text-brand-600 font-semibold hover:underline text-center">
          Try again →
        </button>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

type Tab = "guide" | "feedback" | "exercise";

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "guide",    label: "Guide Mode",        icon: Sparkles,  desc: "Live AI tutor as you write" },
  { id: "feedback", label: "Essay Feedback",    icon: BarChart3, desc: "Examiner-level scoring" },
  { id: "exercise", label: "Adaptive Exercise", icon: Target,    desc: "Targeted at your mistakes" },
];

export function FeatureDemos() {
  const [tab, setTab] = useState<Tab>("guide");
  const [guideKey, setGuideKey] = useState(0);

  function switchTab(t: Tab) {
    setTab(t);
    if (t === "guide") setGuideKey((k) => k + 1);
  }

  return (
    <section>
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Live Preview</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">See it in action</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">Real features, not screenshots. Click each tab to explore.</p>
      </div>

      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {TABS.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} onClick={() => switchTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              tab === id
                ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-700"
            }`}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            <span className={`text-[10px] hidden sm:inline ${tab === id ? "text-brand-200" : "text-slate-400"}`}>· {desc}</span>
          </button>
        ))}
      </div>

      {/* Demo card */}
      <div className="bg-slate-50 border border-[var(--border)] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        {/* Status bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs text-slate-500 font-medium">
            {tab === "guide"    && "AI tutor panel — updates every time you pause typing for 4 seconds"}
            {tab === "feedback" && "Essay feedback — inline annotations, band scores & memory profile"}
            {tab === "exercise" && "Adaptive exercise — generated from your personal error history"}
          </span>
        </div>

        {tab === "guide"    && <GuideModeDemo key={guideKey} />}
        {tab === "feedback" && <EssayFeedbackDemo />}
        {tab === "exercise" && <ExerciseDemo />}
      </div>
    </section>
  );
}
