"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseCard } from "@/components/exercise-card";
import { Dumbbell, Loader2, RefreshCw, CheckCircle } from "lucide-react";
import type { Exercise, ExerciseContent } from "@/types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/exercises");
      const data = await res.json();
      if (res.ok) {
        setExercises(
          (data.exercises || []).map((ex: Record<string, unknown>) => ({
            ...ex,
            content: ex.content as ExerciseContent,
            generatedAt: new Date(ex.generatedAt as string),
            completedAt: ex.completedAt ? new Date(ex.completedAt as string) : null,
          }))
        );
      }
    } catch {
      setError("Failed to load exercises.");
    } finally {
      setIsLoading(false);
    }
  }

  async function generateExercises() {
    try {
      setIsGenerating(true);
      setError(null);
      const res = await fetch("/api/exercises", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchExercises();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate exercises."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleComplete(id: string, score: number) {
    try {
      await fetch(`/api/exercises/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === id ? { ...ex, isCompleted: true, score } : ex
        )
      );
    } catch {
      // Silent fail — the UI has already updated optimistically
    }
  }

  const pending = exercises.filter((e) => !e.isCompleted);
  const completed = exercises.filter((e) => e.isCompleted);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-brand-600" />
            Adaptive Exercises
          </h1>
          <p className="text-slate-500 mt-1">
            Practice targeted to your specific weaknesses — updated as you
            improve.
          </p>
        </div>
        <Button
          onClick={generateExercises}
          disabled={isGenerating}
          className="gap-2 shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate New Exercises
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" />
            <p className="text-slate-500 text-sm">Loading exercises...</p>
          </div>
        </div>
      ) : (
        <>
          {exercises.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-4">
                <Dumbbell className="h-12 w-12 text-slate-300 mx-auto" />
                <div>
                  <p className="text-slate-600 font-medium">
                    No exercises yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Generate exercises based on your error patterns, or submit
                    an essay first to build your profile.
                  </p>
                </div>
                <Button
                  onClick={generateExercises}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Exercises"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Pending */}
              {pending.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700">
                    Practice Now ({pending.length})
                  </h2>
                  <div className="space-y-4">
                    {pending.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onComplete={handleComplete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completed.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Completed ({completed.length})
                  </h2>
                  <div className="space-y-3">
                    {completed.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onComplete={handleComplete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
