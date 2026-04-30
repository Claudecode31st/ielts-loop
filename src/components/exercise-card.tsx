"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Exercise } from "@/types";

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: (id: string, score: number) => void;
}

export function ExerciseCard({ exercise, onComplete }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(exercise.isCompleted);
  const [score, setScore] = useState<number | null>(exercise.score);

  const exerciseTypeColors: Record<string, string> = {
    grammar: "bg-red-100 text-red-700",
    vocabulary: "bg-blue-100 text-blue-700",
    structure: "bg-purple-100 text-purple-700",
    coherence: "bg-orange-100 text-orange-700",
  };

  function handleSubmit() {
    if (!exercise.content?.questions) return;

    let correct = 0;
    exercise.content.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const pct = Math.round(
      (correct / exercise.content.questions.length) * 100
    );
    setScore(pct);
    setSubmitted(true);
    onComplete?.(exercise.id, pct);
  }

  const questions = exercise.content?.questions || [];
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  return (
    <Card className={exercise.isCompleted || submitted ? "border-green-200 bg-green-50/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base leading-tight">
              {exercise.content?.title || "Practice Exercise"}
            </CardTitle>
            <p className="text-xs text-slate-500">
              Target: {exercise.content?.targetSkill || exercise.targetError}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                exerciseTypeColors[exercise.exerciseType] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {exercise.exerciseType}
            </span>
            {(submitted || exercise.isCompleted) && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {score !== null ? `${score}%` : "Done"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {exercise.content?.instructions && (
          <p className="text-sm text-slate-600">{exercise.content.instructions}</p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Questions
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              {submitted || exercise.isCompleted ? "Review Questions" : "Start Exercise"}
            </>
          )}
        </Button>

        {expanded && questions.length > 0 && (
          <div className="space-y-4 pt-2">
            {questions.map((q) => {
              const isAnswered = !!answers[q.id];
              const isCorrect = submitted && answers[q.id] === q.correctAnswer;
              const isWrong = submitted && isAnswered && !isCorrect;

              return (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">
                    {q.id}. {q.question}
                  </p>
                  {q.options && (
                    <div className="space-y-1">
                      {q.options.map((opt, i) => {
                        const isSelected = answers[q.id] === opt;
                        const isCorrectOpt =
                          submitted && opt === q.correctAnswer;
                        const isWrongOpt =
                          submitted && isSelected && opt !== q.correctAnswer;

                        return (
                          <button
                            key={i}
                            disabled={submitted || exercise.isCompleted}
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt,
                              }))
                            }
                            className={`w-full text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                              isCorrectOpt
                                ? "border-green-400 bg-green-50 text-green-800"
                                : isWrongOpt
                                ? "border-red-400 bg-red-50 text-red-800"
                                : isSelected
                                ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {(submitted || exercise.isCompleted) && q.explanation && (
                    <p className="text-xs text-slate-500 pl-2 border-l-2 border-slate-200">
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}

            {!submitted && !exercise.isCompleted && (
              <Button
                className="w-full"
                disabled={!allAnswered}
                onClick={handleSubmit}
              >
                Submit Answers
              </Button>
            )}

            {(submitted || exercise.isCompleted) && score !== null && (
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <p className="text-sm font-semibold text-indigo-800">
                  Score: {score}% —{" "}
                  {score >= 80
                    ? "Excellent work!"
                    : score >= 60
                    ? "Good effort, keep practicing."
                    : "Review the explanations and try again."}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
