"use client";

import { useState, useEffect } from "react";
import { ExerciseCard } from "@/components/exercise-card";
import {
  BookOpen,
  Loader2,
  RefreshCw,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import type { Exercise, ExerciseContent } from "@/types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (res.status === 429) {
        setError(data.error);
        return;
      }
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
    setActiveExerciseId(null);
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
      // silent
    }
  }

  const pending = exercises.filter((e) => !e.isCompleted);
  const completed = exercises.filter((e) => e.isCompleted);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-600" />
            Exercises
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Targeted to your weaknesses — updated as you improve.
          </p>
        </div>

        <button
          onClick={generateExercises}
          disabled={isGenerating}
          className="shrink-0 flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Generate
            </>
          )}
        </button>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="h-7 w-7 animate-spin text-brand-600 mx-auto" />
            <p className="text-slate-400 text-sm">Loading exercises…</p>
          </div>
        </div>
      ) : exercises.length === 0 ? (

        /* ── Empty state ─────────────────────────────────────────────── */
        <div className="text-center py-20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto">
            <BookOpen className="h-7 w-7 text-brand-300" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold">No exercises yet</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
              Generate exercises based on your error patterns, or submit an essay first.
            </p>
          </div>
          <button
            onClick={generateExercises}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Exercises
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Pending ──────────────────────────────────────────────── */}
          {pending.length > 0 && (
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Practice Now
                </h2>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 tabular-nums">
                  {pending.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pending.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
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
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Completed
                </h2>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 tabular-nums">
                  {completed.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completed.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
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
