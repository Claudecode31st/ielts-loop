"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Loader2, Brain, Target, BarChart3,
  CheckCircle2, XCircle, ChevronRight, Trophy,
  AlertCircle, CheckCircle, FileText, BookOpen,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. GUIDE MODE DEMO
//    Matches guide-panel.tsx exactly: BandScoreStrip + SuggestionCard
// ─────────────────────────────────────────────────────────────────────────────

const GUIDE_TEXT =
  "The chart illustrates the proportion of households in the UK from 1990 to 2020. Middle-income groups climbed from 35% to 52%, while low-income households declined steadily from 45% to 28% over the period.";

const GUIDE_SUGS = [
  {
    type: "vocabulary" as const,
    label: "Vocabulary",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    excerpt: "climbed from 35% to 52%",
    tip: "Great verb. Use 'surged' or 'jumped' elsewhere for variety to boost lexical range.",
  },
  {
    type: "cohesion" as const,
    label: "Cohesion",
    icon: Target,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    excerpt: "declined steadily",
    tip: "Add a supporting comparison (e.g. high-income data) to complete your overview paragraph.",
  },
  {
    type: "grammar" as const,
    label: "Grammar",
    icon: CheckCircle2,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    excerpt: "chart illustrates the proportion",
    tip: "'depicts the proportions' reads as more academic — IELTS examiners reward precise noun forms.",
  },
];

function bandColor(s: number) {
  return s >= 7 ? "text-green-600" : s >= 6 ? "text-amber-500" : "text-red-500";
}
function bandBg(s: number) {
  return s >= 7 ? "bg-green-50 border-green-100" : s >= 6 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";
}

function GuideModeDemo() {
  const [text, setText] = useState("");
  const [showScores, setShowScores] = useState(false);
  const [sugs, setSugs] = useState(0);
  const [typing, setTyping] = useState(true);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0; setText(""); setShowScores(false); setSugs(0); setTyping(true);
    let t: ReturnType<typeof setTimeout>;
    function tick() {
      if (idx.current < GUIDE_TEXT.length) {
        idx.current++;
        setText(GUIDE_TEXT.slice(0, idx.current));
        t = setTimeout(tick, 22);
      } else {
        setTyping(false);
        setTimeout(() => setShowScores(true), 700);
        setTimeout(() => setSugs(1), 1300);
        setTimeout(() => setSugs(2), 1900);
        setTimeout(() => setSugs(3), 2500);
        setTimeout(() => { // loop
          idx.current = 0; setText(""); setShowScores(false); setSugs(0); setTyping(true);
          t = setTimeout(tick, 400);
        }, 6500);
      }
    }
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, []);

  const sc = { task: 6.5, cc: 6.0, lex: 6.5, gram: 6.5, overall: 6.5 };

  return (
    <div className="flex gap-3 min-h-[300px]">
      {/* Textarea — matches the real essay textarea */}
      <div className="flex-1 min-w-0 bg-white border border-slate-300 rounded-md p-3 text-sm text-slate-700 leading-relaxed overflow-hidden">
        {text}
        {typing && <span className="animate-pulse text-brand-600 font-bold ml-px">|</span>}
      </div>

      {/* Guide panel — matches guide-panel.tsx */}
      <div className="w-[190px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">AI Tutor</p>
            <p className="text-[10px] text-slate-400">Live feedback as you write</p>
          </div>
          {typing && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500 shrink-0" />}
        </div>

        {/* BandScoreStrip — matches guide-panel.tsx BandScoreStrip exactly */}
        {showScores && (
          <div className={`rounded-xl border p-3 ${bandBg(sc.overall)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Live Band Estimate</span>
              <span className={`text-lg font-extrabold tabular-nums ${bandColor(sc.overall)}`}>{sc.overall.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {([["Task", sc.task], ["CC", sc.cc], ["Lex", sc.lex], ["Gram", sc.gram]] as [string, number][]).map(([lbl, val]) => (
                <div key={lbl} className="flex flex-col items-center gap-0.5 bg-white/60 rounded-lg py-1.5">
                  <span className={`text-sm font-bold tabular-nums ${bandColor(val)}`}>{val.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SuggestionCards — matches guide-panel.tsx SuggestionCard exactly */}
        {GUIDE_SUGS.slice(0, sugs).map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${s.color}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wide ${s.color}`}>{s.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 italic bg-white/70 rounded-lg px-2 py-1 mb-1.5 border border-white/80 line-clamp-2">
                &ldquo;{s.excerpt}&rdquo;
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">{s.tip}</p>
            </div>
          );
        })}

        {!showScores && (
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">Start writing for live feedback…</p>
        )}

        <p className="text-[10px] text-slate-300 text-center mt-auto pt-2">
          Updates a few seconds after you stop typing
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ESSAY FEEDBACK DEMO
//    Matches essay-feedback.tsx + band-score-card.tsx exactly
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_ESSAY_SEGMENTS = [
  { text: "The chart " },
  {
    text: "illustrates",
    cat: "vocabulary",
    badge: "bg-blue-100 text-blue-700",
    border: "border-b-2 border-blue-400",
    activeBg: "bg-blue-50",
    error: "illustrates",
    correction: "depicts / presents",
    explanation: "'Depicts' or 'presents' is more precise academic language for IELTS Task 1 reports.",
    num: 1,
  },
  { text: " the proportion of households in " },
  {
    text: "UK",
    cat: "grammar",
    badge: "bg-red-100 text-red-700",
    border: "border-b-2 border-red-400",
    activeBg: "bg-red-50",
    error: "UK",
    correction: "the UK",
    explanation: "Country names with 'Kingdom' require the definite article 'the' — a common article error in IELTS writing.",
    num: 2,
  },
  { text: " from 1990 to 2020. Middle-income households " },
  {
    text: "climbed significantly",
    cat: "vocabulary",
    badge: "bg-blue-100 text-blue-700",
    border: "border-b-2 border-blue-400",
    activeBg: "bg-blue-50",
    error: null,
    correction: "✓ Strong academic vocabulary",
    explanation: "Excellent verb choice — 'climbed' is precise, academic, and avoids repetition.",
    num: 3,
  },
  { text: ", while low-income groups " },
  {
    text: "went down",
    cat: "vocabulary",
    badge: "bg-blue-100 text-blue-700",
    border: "border-b-2 border-blue-400",
    activeBg: "bg-blue-50",
    error: "went down",
    correction: "declined / decreased",
    explanation: "'Went down' is informal. Academic reports use 'declined', 'decreased', or 'fell' for downward trends.",
    num: 4,
  },
  { text: " over the period." },
];

const DEMO_SCORES = { overallBand: 6.5, taskAchievement: 6.5, coherenceCohesion: 6.0, lexicalResource: 6.5, grammaticalRange: 6.5 };

function getBandBar(score: number) {
  if (score >= 7) return "bg-green-500";
  if (score >= 6) return "bg-amber-400";
  return "bg-red-400";
}
function getBandPill(score: number) {
  if (score >= 7) return "bg-green-100 text-green-800";
  if (score >= 6) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function EssayFeedbackDemo() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3 min-h-[300px]">
      {/* Annotated essay — matches essay-feedback.tsx exactly */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">Your Essay (52 words)</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Grammar (1)</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Vocabulary (3)</span>
          </div>
        </div>
        <div className="p-5 text-sm text-slate-700 leading-8">
          {DEMO_ESSAY_SEGMENTS.map((seg, i) => {
            if (!("cat" in seg)) return <span key={i}>{seg.text}</span>;
            const isActive = activeIdx === i;
            return (
              <span key={i} className="relative group inline">
                <button
                  onClick={() => setActiveIdx((p) => (p === i ? null : i))}
                  className={`inline cursor-pointer rounded-sm px-0.5 ${seg.border} ${isActive ? seg.activeBg : ""} transition-colors duration-150 focus:outline-none`}
                >
                  {seg.text}
                  <sup className="text-[9px] font-bold text-slate-400 ml-px select-none leading-none">{seg.num}</sup>
                </button>
                {/* Tooltip — matches essay-feedback.tsx tooltip exactly */}
                <span className={`pointer-events-none absolute z-50 bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-64 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <span className="block bg-white rounded-xl border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-3 text-left">
                    <span className="flex items-center gap-2 mb-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${seg.badge}`}>{seg.cat}</span>
                      <span className="text-[10px] text-slate-400">Error #{seg.num}</span>
                    </span>
                    <span className="block space-y-1.5 mb-2.5">
                      {seg.error && (
                        <span className="flex items-start gap-1.5">
                          <AlertCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-500 line-through">&ldquo;{seg.error}&rdquo;</span>
                        </span>
                      )}
                      <span className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-green-700">&ldquo;{seg.correction}&rdquo;</span>
                      </span>
                    </span>
                    <span className="block text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">{seg.explanation}</span>
                  </span>
                  <span className="block flex justify-center -mt-px">
                    <span className="block w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
                  </span>
                </span>
              </span>
            );
          })}
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
            <span className="font-medium text-slate-500">4 annotations.</span> Click or hover any underlined text to see the correction.
          </p>
        </div>
      </div>

      {/* Band Score Card — matches band-score-card.tsx exactly */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-slate-900 text-sm">Band Score</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-slate-500">Overall</span>
            <span className="text-3xl font-extrabold text-amber-500 tabular-nums">{DEMO_SCORES.overallBand.toFixed(1)}</span>
          </div>
        </div>
        <div className="space-y-3">
          {([
            ["taskAchievement", "Task Achievement / Response"],
            ["coherenceCohesion", "Coherence & Cohesion"],
            ["lexicalResource", "Lexical Resource"],
            ["grammaticalRange", "Grammatical Range & Accuracy"],
          ] as [keyof typeof DEMO_SCORES, string][]).map(([key, label]) => {
            const score = DEMO_SCORES[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getBandPill(score)}`}>{score.toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getBandBar(score)}`} style={{ width: `${(score / 9) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-3 mt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span>≥ 7.0</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400" /><span>6.0 – 6.5</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400" /><span>&lt; 6.0</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADAPTIVE EXERCISE DEMO
//    Matches exercise-card.tsx "playing" state exactly
// ─────────────────────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D"];

const DEMO_EX = {
  title: "Present Perfect vs Past Simple",
  targetSkill: "Tense accuracy in academic writing",
  type: "grammar",
  badge: "bg-red-100 text-red-700",
  bar: "bg-red-500",
  dot: "bg-red-400",
  gradient: "from-red-500 to-red-600",
  questions: [
    {
      id: 1,
      question: "Since 2010, the number of electric vehicles on UK roads ___ dramatically.",
      options: ["has risen", "have risen", "rose", "is rising"],
      correctAnswer: "has risen",
      explanation: "Use present perfect ('has risen') for a trend that started in the past and still continues — the standard IELTS Task 1 pattern for ongoing changes.",
    },
    {
      id: 2,
      question: "The proportion of elderly residents ___ by 12% between 2000 and 2020.",
      options: ["has increased", "increased", "have increased", "increasing"],
      correctAnswer: "increased",
      explanation: "Use simple past ('increased') for a completed action with a specific finished time period (2000–2020).",
    },
    {
      id: 3,
      question: "The government ___ new regulations to reduce emissions since last year.",
      options: ["introduced", "has introduced", "have introduced", "introducing"],
      correctAnswer: "has introduced",
      explanation: "'Since last year' signals present perfect — the action connects the past to now.",
    },
  ],
};

function ExerciseDemo() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const q = DEMO_EX.questions[currentQ];
  const isAnswered = selected !== null;
  const isLastQ = currentQ === DEMO_EX.questions.length - 1;
  const isCorrect = isAnswered && selected === q.correctAnswer;
  const progress = (currentQ / DEMO_EX.questions.length) * 100;

  function pick(opt: string) {
    if (isAnswered) return;
    setSelected(opt);
    setAllAnswers((p) => ({ ...p, [q.id]: opt }));
  }

  function goNext() {
    if (isLastQ) { setFinished(true); return; }
    setCurrentQ((p) => p + 1);
    setSelected(null);
  }

  function restart() {
    setCurrentQ(0); setSelected(null); setAllAnswers({}); setFinished(false);
  }

  if (finished) {
    const correct = DEMO_EX.questions.filter((qq) => allAnswers[qq.id] === qq.correctAnswer).length;
    const pct = Math.round((correct / DEMO_EX.questions.length) * 100);
    const isGood = pct >= 80;
    const gradient = isGood ? "from-brand-600 to-brand-700" : "from-amber-500 to-amber-600";
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
        <div className={`bg-gradient-to-br ${gradient} text-white px-5 py-5 flex items-center gap-4`}>
          <div className="text-4xl font-extrabold tabular-nums">{pct}%</div>
          <div>
            <p className="text-sm font-bold">{isGood ? "✨ Great work!" : "👍 Good effort!"}</p>
            <p className="text-xs opacity-70 mt-0.5">{correct} of {DEMO_EX.questions.length} correct · {DEMO_EX.title}</p>
          </div>
          <Trophy className="h-6 w-6 opacity-40 ml-auto" />
        </div>
        <div className="p-5 space-y-3">
          {DEMO_EX.questions.map((qq, i) => {
            const wasCorrect = allAnswers[qq.id] === qq.correctAnswer;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${wasCorrect ? "bg-green-50/70 border-green-200" : "bg-red-50/70 border-red-200"}`}>
                <span className="shrink-0 w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200">{i + 1}</span>
                {wasCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-slate-700 font-medium leading-snug line-clamp-1">{qq.question}</p>
                  {!wasCorrect && <p className="text-xs text-green-700 font-medium mt-0.5">✓ {qq.correctAnswer}</p>}
                </div>
              </div>
            );
          })}
          <button onClick={restart} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-2 border-brand-300 rounded-2xl shadow-xl shadow-brand-100/40 overflow-hidden min-h-[300px]">
      {/* Progress header — matches exercise-card.tsx playing state exactly */}
      <div className="px-5 pt-4 pb-3 bg-white/50 border-b border-white/50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${DEMO_EX.badge}`}>{DEMO_EX.type}</span>
            <span className="text-sm font-bold text-slate-800 truncate">{DEMO_EX.title}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0">{currentQ + 1} / {DEMO_EX.questions.length}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
          <div className={`h-full rounded-full ${DEMO_EX.bar} transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1">
          {DEMO_EX.questions.map((qq, i) => {
            const ans = allAnswers[qq.id];
            const wasCorrect = ans === qq.correctAnswer;
            return (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentQ ? (wasCorrect ? "bg-green-400" : "bg-red-400") : i === currentQ ? DEMO_EX.dot : "bg-slate-200"
              }`} />
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.question}</p>

        {/* Options with letter badges — matches exercise-card.tsx exactly */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrectOpt = isAnswered && opt === q.correctAnswer;
            const isWrongOpt = isAnswered && isSelected && opt !== q.correctAnswer;
            let rowClass = "border-slate-200/80 bg-white/60 text-slate-700 hover:border-brand-300 hover:bg-brand-50/40 cursor-pointer";
            let letterClass = "bg-slate-100 text-slate-500";
            if (isCorrectOpt) { rowClass = "border-green-400 bg-green-50 text-green-900 cursor-default"; letterClass = "bg-green-500 text-white"; }
            else if (isWrongOpt) { rowClass = "border-red-400 bg-red-50 text-red-900 cursor-default"; letterClass = "bg-red-500 text-white"; }
            else if (isAnswered) { rowClass = "border-slate-100 bg-white/30 text-slate-400 cursor-default"; letterClass = "bg-slate-100 text-slate-300"; }
            return (
              <button key={i} disabled={isAnswered} onClick={() => pick(opt)}
                className={`w-full text-left text-sm px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 ${rowClass}`}>
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${letterClass}`}>{LETTERS[i]}</span>
                <span className="flex-1 leading-snug">{opt}</span>
                {isCorrectOpt && <CheckCircle2 className="shrink-0 h-4 w-4 text-green-600" />}
                {isWrongOpt && <XCircle className="shrink-0 h-4 w-4 text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Instant feedback — matches exercise-card.tsx exactly */}
        {isAnswered && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-bold mb-1 ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                {isCorrect ? "Correct! Well done." : `Incorrect — correct answer: "${q.correctAnswer}"`}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">{q.explanation}</p>
            </div>
          </div>
        )}

        {isAnswered && (
          <button onClick={goNext}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r ${DEMO_EX.gradient} hover:opacity-90 transition-opacity`}>
            {isLastQ ? <><Trophy className="h-4 w-4" />See Results</> : <>Next Question<ChevronRight className="h-4 w-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

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
        <p className="text-sm text-slate-500 max-w-md mx-auto">The real UI — not screenshots. Click each tab to explore.</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {TABS.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} onClick={() => switchTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              tab === id ? "bg-brand-600 text-white border-brand-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-700"
            }`}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            <span className={`text-[10px] hidden sm:inline ${tab === id ? "text-brand-200" : "text-slate-400"}`}>· {desc}</span>
          </button>
        ))}
      </div>

      <div className="bg-slate-50 border border-[var(--border)] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs text-slate-500 font-medium">
            {tab === "guide"    && "Guide Mode — band scores and suggestions update as you write"}
            {tab === "feedback" && "Essay Feedback — click any underlined word to see the correction"}
            {tab === "exercise" && "Adaptive Exercise — 3 questions generated from your error history"}
          </span>
        </div>

        {tab === "guide"    && <GuideModeDemo key={guideKey} />}
        {tab === "feedback" && <EssayFeedbackDemo />}
        {tab === "exercise" && <ExerciseDemo />}
      </div>
    </section>
  );
}
