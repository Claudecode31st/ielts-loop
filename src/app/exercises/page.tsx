"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ExerciseCard } from "@/components/exercise-card";
import {
  BookOpen,
  Loader2,
  RefreshCw,
  CheckCircle,
  Sparkles,
  PenLine,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import type { Exercise, ExerciseContent } from "@/types";

export default function ExercisesPage() {
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus"); // specific error type from score-blockers CTA

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noEssays, setNoEssays] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  // On mount: if a focus topic was passed, auto-generate for that topic
  useEffect(() => {
    if (focus) {
      generateExercises(focus);
    } else {
      fetchExercises();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function generateExercises(focusTopic?: string) {
    try {
      setIsGenerating(true);
      setIsLoading(false);
      setError(null);
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(focusTopic ? { focus: focusTopic } : {}),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError(data.error);
        return;
      }
      if (res.status === 400 && data.noEssays) {
        setNoEssays(true);
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

  async function clearExercises() {
    try {
      setIsClearing(true);
      await fetch("/api/exercises", { method: "DELETE" });
      setExercises([]);
      setClearOpen(false);
    } catch {
      setError("Failed to clear exercises.");
    } finally {
      setIsClearing(false);
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
            {focus
              ? <>Focused on: <span className="font-medium text-slate-600">{focus}</span></>
              : "Targeted to your weaknesses — updated as you improve."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {exercises.length > 0 && (
            <Dialog open={clearOpen} onOpenChange={setClearOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear all exercises?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}, including completed ones. Your essay history and AI memory are not affected. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <button
                    onClick={() => setClearOpen(false)}
                    className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearExercises}
                    disabled={isClearing}
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isClearing ? <><Loader2 className="h-4 w-4 animate-spin" /> Clearing…</> : <><Trash2 className="h-4 w-4" /> Yes, clear all</>}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <button
            onClick={() => generateExercises()}
            disabled={isGenerating || noEssays}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        noEssays ? (
          /* No essays submitted yet */
          <div className="text-center py-20 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
              <PenLine className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-700 font-semibold">Submit an essay first</p>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                Exercises are personalised to your actual mistakes. Submit an essay so the AI knows what to target.
              </p>
            </div>
            <Link
              href="/essay/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
            >
              <PenLine className="h-4 w-4" />
              Submit an Essay
            </Link>
          </div>
        ) : (
          /* Has essays but no exercises generated yet */
          <div className="text-center py-20 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto">
              <BookOpen className="h-7 w-7 text-brand-300" />
            </div>
            <div>
              <p className="text-slate-700 font-semibold">No exercises yet</p>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                Generate exercises targeted at your specific error patterns.
              </p>
            </div>
            <button
              onClick={() => generateExercises()}
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
        )
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
