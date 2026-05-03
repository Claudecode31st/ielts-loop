"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Play,
  Lock,
  X,
  Trophy,
} from "lucide-react";
import type { Exercise } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D", "E"];

const TYPE_STYLE: Record<
  string,
  { badge: string; bar: string; dot: string; gradient: string }
> = {
  grammar: {
    badge: "bg-brand-50 text-brand-700",
    bar: "bg-brand-500",
    dot: "bg-brand-400",
    gradient: "from-brand-600 to-brand-700",
  },
  vocabulary: {
    badge: "bg-brand-50 text-brand-700",
    bar: "bg-brand-500",
    dot: "bg-brand-400",
    gradient: "from-brand-600 to-brand-700",
  },
  structure: {
    badge: "bg-brand-50 text-brand-700",
    bar: "bg-brand-500",
    dot: "bg-brand-400",
    gradient: "from-brand-600 to-brand-700",
  },
  coherence: {
    badge: "bg-brand-50 text-brand-700",
    bar: "bg-brand-500",
    dot: "bg-brand-400",
    gradient: "from-brand-600 to-brand-700",
  },
};

const FALLBACK = {
  badge: "bg-brand-50 text-brand-700",
  bar: "bg-brand-500",
  dot: "bg-brand-400",
  gradient: "from-brand-600 to-brand-700",
};

type CardState = "idle" | "playing" | "finished";

// ── Component ──────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise;
  index?: number;
  isLocked?: boolean;
  onActivate?: () => void;
  onComplete?: (id: string, score: number) => void;
}

export function ExerciseCard({
  exercise,
  isLocked = false,
  onActivate,
  onComplete,
}: ExerciseCardProps) {
  const [cardState, setCardState] = useState<CardState>(
    exercise.isCompleted ? "finished" : "idle"
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(exercise.score ?? null);

  const questions = exercise.content?.questions ?? [];
  const style = TYPE_STYLE[exercise.exerciseType] ?? FALLBACK;
  const q = questions[currentQ];
  const isAnswered = selectedAnswer !== null;
  const isLastQ = currentQ === questions.length - 1;
  const isCorrectAnswer = isAnswered && selectedAnswer === q?.correctAnswer;

  // ── Actions ────────────────────────────────────────────────────────────

  function startQuiz() {
    onActivate?.();
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAllAnswers({});
    setCardState("playing");
  }

  function exitQuiz() {
    setCardState("idle");
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAllAnswers({});
    onComplete?.(exercise.id, -1);
  }

  function selectAnswer(opt: string) {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setAllAnswers((prev) => ({ ...prev, [q.id]: opt }));
  }

  function goNext() {
    if (isLastQ) {
      const finalAnswers = { ...allAnswers };
      let correct = 0;
      questions.forEach((question) => {
        if (finalAnswers[question.id] === question.correctAnswer) correct++;
      });
      const pct = Math.round((correct / questions.length) * 100);
      setScore(pct);
      setCardState("finished");
      onComplete?.(exercise.id, pct);
    } else {
      setCurrentQ((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  }

  // ── IDLE ──────────────────────────────────────────────────────────────

  if (cardState === "idle") {
    return (
      <button
        disabled={isLocked}
        onClick={startQuiz}
        className={`w-full text-left rounded-xl bg-white border border-slate-200 transition-all duration-200 group
          ${isLocked ? "opacity-40 cursor-not-allowed" : "hover:border-brand-200 hover:bg-brand-50/30 cursor-pointer"}`}
      >
        <div className="px-3.5 py-3 flex items-center gap-2.5">
          {/* Type dot */}
          <div className={`shrink-0 w-2 h-2 rounded-full ${style.dot}`} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                {exercise.exerciseType}
              </span>
              <span className="text-[10px] text-slate-400">
                {questions.length}Q
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-snug truncate">
              {exercise.content?.title ?? "Practice Exercise"}
            </p>
          </div>

          {/* Right indicator */}
          {isLocked ? (
            <Lock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          ) : (
            <Play className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500 shrink-0 transition-colors ml-0.5" />
          )}
        </div>
      </button>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────

  if (cardState === "playing" && q) {
    const progressPct = (currentQ / questions.length) * 100;

    return (
      <div className="rounded-xl bg-white border-2 border-brand-300 shadow-lg shadow-brand-100/40 overflow-hidden">
        {/* Progress header */}
        <div className="px-4 pt-3.5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge} shrink-0`}>
                {exercise.exerciseType}
              </span>
              <span className="text-sm font-semibold text-slate-700 truncate">
                {exercise.content?.title ?? "Exercise"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 tabular-nums">
                {currentQ + 1}/{questions.length}
              </span>
              <button
                onClick={exitQuiz}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full ${style.bar} transition-all duration-500`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1">
            {questions.map((question, i) => {
              const answered = allAnswers[question.id];
              const wasCorrect = answered === question.correctAnswer;
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < currentQ
                      ? wasCorrect ? "bg-green-400" : "bg-red-400"
                      : i === currentQ
                      ? style.dot
                      : "bg-slate-200"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Question */}
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {q.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {q.options?.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = isAnswered && opt === q.correctAnswer;
              const isWrongOpt = isAnswered && isSelected && opt !== q.correctAnswer;

              let rowClass =
                "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer";
              let letterClass =
                "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700";

              if (isCorrectOpt) {
                rowClass = "border-green-400 bg-green-50 text-green-900 cursor-default";
                letterClass = "bg-green-500 text-white";
              } else if (isWrongOpt) {
                rowClass = "border-red-400 bg-red-50 text-red-900 cursor-default";
                letterClass = "bg-red-500 text-white";
              } else if (isAnswered) {
                rowClass = "border-slate-100 bg-slate-50/50 text-slate-400 cursor-default";
                letterClass = "bg-slate-100 text-slate-300";
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => selectAnswer(opt)}
                  className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 group ${rowClass}`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${letterClass}`}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {isCorrectOpt && <CheckCircle2 className="shrink-0 h-4 w-4 text-green-600" />}
                  {isWrongOpt && <XCircle className="shrink-0 h-4 w-4 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Instant feedback */}
          {isAnswered && (
            <div
              className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm ${
                isCorrectAnswer
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {isCorrectAnswer ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold mb-0.5 ${
                    isCorrectAnswer ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isCorrectAnswer
                    ? "Correct!"
                    : `Correct: "${q.correctAnswer}"`}
                </p>
                {q.explanation && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Next / Finish */}
          {isAnswered && (
            <button
              onClick={goNext}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${style.gradient} hover:opacity-90 transition-opacity`}
            >
              {isLastQ ? (
                <>
                  <Trophy className="h-4 w-4" />
                  See Results
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── FINISHED ──────────────────────────────────────────────────────────

  const finalScore = score ?? 0;
  const correctCount = questions.filter(
    (question) => allAnswers[question.id] === question.correctAnswer
  ).length;
  const isPerfect = finalScore === 100;
  const isGood = finalScore >= 80;
  const isOk = finalScore >= 60;
  const hasAnswerData = Object.keys(allAnswers).length > 0;

  const resultGradient = isPerfect
    ? "from-emerald-500 to-emerald-600"
    : isGood
    ? "from-brand-600 to-brand-700"
    : isOk
    ? "from-amber-500 to-amber-600"
    : "from-slate-500 to-slate-600";

  const resultEmoji = isPerfect ? "🎉" : isGood ? "✨" : isOk ? "👍" : "📖";
  const resultMsg = isPerfect
    ? "Perfect score!"
    : isGood
    ? "Great work!"
    : isOk
    ? "Good effort!"
    : "Keep practising";

  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      {/* Compact score row */}
      <div className="px-3.5 py-3 flex items-center gap-2.5">
        {/* Score pill */}
        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${resultGradient}`}>
          {finalScore}%
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">
            {exercise.content?.title ?? "Exercise"}
          </p>
          {hasAnswerData && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              {resultEmoji} {resultMsg} · {correctCount}/{questions.length} correct
            </p>
          )}
        </div>

        {/* Retry */}
        <button
          onClick={startQuiz}
          className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
