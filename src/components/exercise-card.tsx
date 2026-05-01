"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  RotateCcw,
  Play,
  BookOpen,
  Sparkles,
  Lock,
  X,
} from "lucide-react";
import type { Exercise } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D", "E"];

const TYPE_STYLE: Record<
  string,
  { badge: string; bar: string; dot: string; gradient: string; stripe: string }
> = {
  grammar: {
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    dot: "bg-red-400",
    gradient: "from-red-500 to-red-600",
    stripe: "bg-red-500",
  },
  vocabulary: {
    badge: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
    dot: "bg-blue-400",
    gradient: "from-blue-500 to-blue-600",
    stripe: "bg-blue-500",
  },
  structure: {
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    dot: "bg-amber-400",
    gradient: "from-amber-500 to-amber-600",
    stripe: "bg-amber-500",
  },
  coherence: {
    badge: "bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
    dot: "bg-orange-400",
    gradient: "from-orange-500 to-orange-600",
    stripe: "bg-orange-500",
  },
};

const FALLBACK = {
  badge: "bg-slate-100 text-slate-700",
  bar: "bg-brand-500",
  dot: "bg-brand-400",
  gradient: "from-brand-600 to-brand-700",
  stripe: "bg-brand-500",
};

type CardState = "idle" | "playing" | "finished";

// ── Component ──────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise;
  index?: number;
  /** Another exercise is currently active — lock this one */
  isLocked?: boolean;
  /** Called when the user clicks Start Practice on this card */
  onActivate?: () => void;
  onComplete?: (id: string, score: number) => void;
}

export function ExerciseCard({
  exercise,
  index,
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
    // Release the active lock in the parent
    onComplete?.(exercise.id, -1); // -1 = aborted, parent clears activeId
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

  // ── IDLE (compact) ────────────────────────────────────────────────────

  if (cardState === "idle") {
    return (
      <Card
        variant="glass"
        className={`overflow-hidden transition-all duration-300 ${
          isLocked ? "opacity-50" : ""
        }`}
      >
        <CardContent className="p-0">
          <div className="px-5 py-4 flex items-center gap-4">
            {/* Number badge */}
            {index !== undefined && (
              <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                {index}
              </span>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {exercise.exerciseType}
                </span>
                <span className="text-xs text-slate-400">
                  {questions.length} questions
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-snug truncate">
                {exercise.content?.title ?? "Practice Exercise"}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {exercise.content?.targetSkill ?? exercise.targetError}
              </p>
            </div>

            {/* CTA */}
            {isLocked ? (
              <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Lock className="h-3.5 w-3.5" />
                Finish current
              </div>
            ) : (
              <Button
                size="sm"
                onClick={startQuiz}
                className="shrink-0 gap-1.5 bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-xl shadow-sm font-semibold"
              >
                <Play className="h-3.5 w-3.5" />
                Start
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────

  if (cardState === "playing" && q) {
    const progressPct = (currentQ / questions.length) * 100;

    return (
      <Card variant="glass" className="overflow-hidden ring-2 ring-brand-300 shadow-xl shadow-brand-100/40">
        <CardContent className="p-0">
          {/* Progress header */}
          <div className="px-5 pt-4 pb-3 bg-white/50 border-b border-white/50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.badge} shrink-0`}>
                  {exercise.exerciseType}
                </span>
                <span className="text-sm font-bold text-slate-800 truncate">
                  {exercise.content?.title ?? "Exercise"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-400 tabular-nums">
                  {currentQ + 1} / {questions.length}
                </span>
                <button
                  onClick={exitQuiz}
                  title="Exit exercise"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
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
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
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

          <div className="p-5 space-y-4">
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

                let rowClass = "border-slate-200/80 bg-white/60 text-slate-700 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm cursor-pointer";
                let letterClass = "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700";

                if (isCorrectOpt) {
                  rowClass = "border-green-400 bg-green-50 text-green-900 shadow-sm cursor-default";
                  letterClass = "bg-green-500 text-white";
                } else if (isWrongOpt) {
                  rowClass = "border-red-400 bg-red-50 text-red-900 shadow-sm cursor-default";
                  letterClass = "bg-red-500 text-white";
                } else if (isAnswered) {
                  rowClass = "border-slate-100 bg-white/30 text-slate-400 cursor-default";
                  letterClass = "bg-slate-100 text-slate-300";
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => selectAnswer(opt)}
                    className={`w-full text-left text-sm px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 group ${rowClass}`}
                  >
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${letterClass}`}>
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
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isCorrectAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}>
                {isCorrectAnswer
                  ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                }
                <div className="min-w-0">
                  <p className={`text-sm font-bold mb-1 ${isCorrectAnswer ? "text-green-800" : "text-red-800"}`}>
                    {isCorrectAnswer ? "Correct! Well done." : `Incorrect — correct answer: "${q.correctAnswer}"`}
                  </p>
                  {q.explanation && (
                    <p className="text-xs text-slate-600 leading-relaxed">{q.explanation}</p>
                  )}
                </div>
              </div>
            )}

            {/* Next / Finish */}
            {isAnswered && (
              <Button
                onClick={goNext}
                className={`w-full gap-2 bg-gradient-to-r ${style.gradient} hover:opacity-90 text-white rounded-xl border-0 font-semibold`}
              >
                {isLastQ
                  ? <><Trophy className="h-4 w-4" />See Results</>
                  : <>Next Question<ChevronRight className="h-4 w-4" /></>
                }
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
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
    : isGood ? "from-brand-600 to-brand-700"
    : isOk ? "from-amber-500 to-amber-600"
    : "from-slate-500 to-slate-600";

  const resultEmoji = isPerfect ? "🎉" : isGood ? "✨" : isOk ? "👍" : "📖";
  const resultMsg = isPerfect ? "Perfect score!" : isGood ? "Great work!" : isOk ? "Good effort!" : "Keep practising";

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-0">
        {/* Score banner */}
        <div className={`bg-gradient-to-br ${resultGradient} text-white px-5 py-5 flex items-center gap-4`}>
          <div className="text-4xl font-extrabold tabular-nums">{finalScore}%</div>
          <div>
            <p className="text-sm font-bold opacity-95">{resultEmoji} {resultMsg}</p>
            {hasAnswerData && (
              <p className="text-xs opacity-70 mt-0.5">
                {correctCount} of {questions.length} correct · {exercise.content?.title}
              </p>
            )}
            {!hasAnswerData && exercise.isCompleted && (
              <p className="text-xs opacity-70 mt-0.5">{exercise.content?.title}</p>
            )}
          </div>
          <Sparkles className="h-6 w-6 opacity-40 ml-auto" />
        </div>

        <div className="p-5 space-y-4">
          {/* Per-question review */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Review</p>
              {questions.map((question, i) => {
                const userAnswer = allAnswers[question.id];
                const wasCorrect = userAnswer === question.correctAnswer;
                const hasData = !!userAnswer;
                return (
                  <div
                    key={question.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                      hasData
                        ? wasCorrect ? "bg-green-50/70 border-green-200" : "bg-red-50/70 border-red-200"
                        : "bg-white/50 border-slate-200"
                    }`}
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5 border border-slate-200">
                      {i + 1}
                    </span>
                    {hasData
                      ? wasCorrect
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      : <BookOpen className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 font-medium leading-snug line-clamp-2">
                        {question.question}
                      </p>
                      {hasData && !wasCorrect && (
                        <p className="text-xs text-green-700 font-medium mt-0.5">
                          ✓ {question.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Try again — always available */}
          <Button
            variant="outline"
            onClick={startQuiz}
            className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 rounded-xl font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            {isPerfect ? "Practice Again" : "Try Again"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
