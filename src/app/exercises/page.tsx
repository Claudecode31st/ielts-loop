"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/exercise-card";
import {
  Dumbbell,
  Loader2,
  RefreshCw,
  CheckCircle,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import type { Exercise, ExerciseContent } from "@/types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only one exercise can be in "playing" state at a time
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

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
            completedAt: ex.completedAt
              ? new Date(ex.completedAt as string)
              : null,
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
    setActiveExerciseId(null); // release the lock regardless

    // score = -1 means the user quit — don't mark as complete
    if (score < 0) return;

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
      // silent — UI already updated
    }
  }

  const pending = exercises.filter((e) => !e.isCompleted);
  const completed = exercises.filter((e) => e.isCompleted);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-brand-600" />
            Adaptive Exercises
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Targeted to your specific weaknesses — updated as you improve.
          </p>
        </div>
        <Button
          onClick={generateExercises}
          disabled={isGenerating}
          className="gap-2 shrink-0 bg-gradient-to-r from-brand-600 to-brand-700 text-white border-0 rounded-xl shadow-md hover:opacity-90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate New
            </>
          )}
        </Button>
      </div>

      {/* ── Stats pills ────────────────────────────────────────────────── */}
      {exercises.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-white/80 shadow-sm text-xs font-semibold text-slate-600">
            <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
            {exercises.length} total
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              {pending.length} to practice
            </div>
          )}
          {completed.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
              <CheckCircle className="h-3.5 w-3.5" />
              {completed.length} completed
            </div>
          )}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" />
            <p className="text-slate-500 text-sm">Loading exercises…</p>
          </div>
        </div>
      ) : exercises.length === 0 ? (

        /* ── Empty state ─────────────────────────────────────────────── */
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto">
            <Dumbbell className="h-8 w-8 text-brand-300" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold">No exercises yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Generate exercises based on your error patterns, or submit an
              essay first.
            </p>
          </div>
          <Button
            onClick={generateExercises}
            disabled={isGenerating}
            className="bg-gradient-to-r from-brand-600 to-brand-700 text-white border-0 rounded-xl"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
            ) : (
              "Generate Exercises"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Pending ──────────────────────────────────────────────── */}
          {pending.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Practice Now
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                  {pending.length}
                </span>
              </div>
              <div className="space-y-3">
                {pending.map((exercise, idx) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={idx + 1}
                    isLocked={
                      activeExerciseId !== null &&
                      activeExerciseId !== exercise.id
                    }
                    onActivate={() => setActiveExerciseId(exercise.id)}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Completed ────────────────────────────────────────────── */}
          {completed.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Completed
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {completed.length}
                </span>
              </div>
              <div className="space-y-3">
                {completed.map((exercise, idx) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={idx + 1}
                    isLocked={false}
                    onActivate={() => {}}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
