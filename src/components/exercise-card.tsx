"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Target,
  RotateCcw,
  Play,
  BookOpen,
  Sparkles,
} from "lucide-react";
import type { Exercise } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D", "E"];

const TYPE_STYLE: Record<
  string,
  { badge: string; bar: string; dot: string; header: string }
> = {
  grammar: {
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    dot: "bg-red-400",
    header: "from-red-500 to-red-600",
  },
  vocabulary: {
    badge: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
    dot: "bg-blue-400",
    header: "from-blue-500 to-blue-600",
  },
  structure: {
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    dot: "bg-amber-400",
    header: "from-amber-500 to-amber-600",
  },
  coherence: {
    badge: "bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
    dot: "bg-orange-400",
    header: "from-orange-500 to-orange-600",
  },
};

const FALLBACK_STYLE = {
  badge: "bg-slate-100 text-slate-700",
  bar: "bg-brand-500",
  dot: "bg-brand-400",
  header: "from-brand-600 to-brand-700",
};

type CardState = "idle" | "playing" | "finished";

// ── Component ──────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: (id: string, score: number) => void;
}

export function ExerciseCard({ exercise, onComplete }: ExerciseCardProps) {
  const [cardState, setCardState] = useState<CardState>(
    exercise.isCompleted ? "finished" : "idle"
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(exercise.score ?? null);

  const questions = exercise.content?.questions ?? [];
  const style = TYPE_STYLE[exercise.exerciseType] ?? FALLBACK_STYLE;
  const q = questions[currentQ];
  const isAnswered = selectedAnswer !== null;
  const isLastQ = currentQ === questions.length - 1;
  const isCorrectAnswer = isAnswered && selectedAnswer === q?.correctAnswer;

  // ── Actions ────────────────────────────────────────────────────────────

  function startQuiz() {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAllAnswers({});
    setCardState("playing");
  }

  function selectAnswer(opt: string) {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setAllAnswers((prev) => ({ ...prev, [q.id]: opt }));
  }

  function goNext() {
    if (isLastQ) {
      // Tally score using finalised allAnswers
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
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-0">
          {/* Coloured top stripe */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${style.header}`} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.badge}`}>
                    {exercise.exerciseType}
                  </span>
                  <span className="text-xs text-slate-400">
                    {questions.length} questions
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {exercise.content?.title ?? "Practice Exercise"}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {exercise.content?.targetSkill ?? exercise.targetError}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100/80 flex items-center justify-center shrink-0">
                <Target className="h-6 w-6 text-slate-400" />
              </div>
            </div>

            {exercise.content?.instructions && (
              <p className="text-sm text-slate-600 leading-relaxed mb-5 pb-4 border-b border-slate-100">
                {exercise.content.instructions}
              </p>
            )}

            <Button
              onClick={startQuiz}
              className={`w-full gap-2 bg-gradient-to-r ${style.header} hover:opacity-90 text-white rounded-xl border-0 shadow-md shadow-slate-200/60 font-semibold`}
            >
              <Play className="h-4 w-4" />
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────

  if (cardState === "playing" && q) {
    const progressPct = (currentQ / questions.length) * 100;

    return (
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header with progress */}
          <div className="px-5 pt-4 pb-3 bg-white/40 border-b border-white/50">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.badge} shrink-0`}>
                  {exercise.exerciseType}
                </span>
                <span className="text-sm font-semibold text-slate-700 truncate">
                  {exercise.content?.title ?? "Exercise"}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 shrink-0">
                {currentQ + 1} / {questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${style.bar} transition-all duration-500`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Step dots showing correct/wrong/pending */}
            <div className="flex items-center gap-1">
              {questions.map((question, i) => {
                const answered = allAnswers[question.id];
                const wasCorrect = answered === question.correctAnswer;
                return (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < currentQ
                        ? wasCorrect
                          ? "bg-green-400"
                          : "bg-red-400"
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
            {/* Question text */}
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {q.question}
            </p>

            {/* Answer options */}
            <div className="space-y-2">
              {q.options?.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrectOpt = isAnswered && opt === q.correctAnswer;
                const isWrongOpt =
                  isAnswered && isSelected && opt !== q.correctAnswer;

                let rowStyle =
                  "border-slate-200/80 bg-white/60 text-slate-700 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm cursor-pointer";
                let letterStyle =
                  "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700";

                if (isCorrectOpt) {
                  rowStyle =
                    "border-green-400 bg-green-50 text-green-900 shadow-sm cursor-default";
                  letterStyle = "bg-green-500 text-white";
                } else if (isWrongOpt) {
                  rowStyle =
                    "border-red-400 bg-red-50 text-red-900 shadow-sm cursor-default";
                  letterStyle = "bg-red-500 text-white";
                } else if (isAnswered) {
                  rowStyle =
                    "border-slate-100 bg-white/30 text-slate-400 cursor-default";
                  letterStyle = "bg-slate-100 text-slate-300";
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => selectAnswer(opt)}
                    className={`
                      w-full text-left text-sm px-4 py-3 rounded-xl border-2
                      flex items-center gap-3 transition-all duration-200 group
                      ${rowStyle}
                    `}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${letterStyle}`}
                    >
                      {LETTERS[i]}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isCorrectOpt && (
                      <CheckCircle2 className="shrink-0 h-4 w-4 text-green-600" />
                    )}
                    {isWrongOpt && (
                      <XCircle className="shrink-0 h-4 w-4 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant feedback panel */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
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
                    className={`text-sm font-bold mb-1 ${
                      isCorrectAnswer ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrectAnswer
                      ? "Correct! Well done."
                      : `Incorrect — the answer is: "${q.correctAnswer}"`}
                  </p>
                  {q.explanation && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Next / Finish CTA */}
            {isAnswered && (
              <Button
                onClick={goNext}
                className={`w-full gap-2 bg-gradient-to-r ${style.header} hover:opacity-90 text-white rounded-xl border-0 font-semibold`}
              >
                {isLastQ ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    See Results
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
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
    : isGood
    ? "from-brand-600 to-brand-700"
    : isOk
    ? "from-amber-500 to-amber-600"
    : "from-slate-500 to-slate-600";

  const resultEmoji = isPerfect ? "🎉" : isGood ? "✨" : isOk ? "👍" : "📖";
  const resultMessage = isPerfect
    ? "Perfect score!"
    : isGood
    ? "Great work!"
    : isOk
    ? "Good effort!"
    : "Keep practising";

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-0">
        {/* Score banner */}
        <div
          className={`bg-gradient-to-br ${resultGradient} text-white px-5 py-6 text-center`}
        >
          <div className="text-5xl font-extrabold mb-1">{finalScore}%</div>
          <p className="text-sm font-semibold opacity-90">
            {resultEmoji} {resultMessage}
          </p>
          {hasAnswerData && (
            <p className="text-xs opacity-70 mt-1">
              {correctCount} of {questions.length} correct
            </p>
          )}
          <div className="mt-3 text-xs font-semibold opacity-80 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {exercise.content?.title ?? "Exercise"} complete
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Per-question review */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Review
              </p>
              {questions.map((question, i) => {
                const userAnswer = allAnswers[question.id];
                const wasCorrect = userAnswer === question.correctAnswer;
                const hasData = !!userAnswer;

                return (
                  <div
                    key={question.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                      hasData
                        ? wasCorrect
                          ? "bg-green-50/70 border-green-200"
                          : "bg-red-50/70 border-red-200"
                        : "bg-white/50 border-slate-200"
                    }`}
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5 border border-slate-200">
                      {i + 1}
                    </span>
                    {hasData ? (
                      wasCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      )
                    ) : (
                      <BookOpen className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
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

          {/* Try again (if not perfect and not already a saved completed exercise) */}
          {!exercise.isCompleted && (
            <Button
              variant="outline"
              onClick={startQuiz}
              className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 rounded-xl font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              {isPerfect ? "Practice Again" : "Try Again"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
