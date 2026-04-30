"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, PenLine, Info } from "lucide-react";
import { countWords } from "@/lib/utils";
import type { TaskType } from "@/types";

const MIN_WORDS = { task1: 150, task2: 250 };
const RECOMMENDED_WORDS = { task1: 180, task2: 280 };

export default function NewEssayPage() {
  const router = useRouter();
  const [taskType, setTaskType] = useState<TaskType>("task2");
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(essay);
  const minWords = MIN_WORDS[taskType];
  const recWords = RECOMMENDED_WORDS[taskType];
  const isUnderMin = essay.trim().length > 0 && wordCount < minWords;
  const isGood = wordCount >= recWords;

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter the task prompt.");
      return;
    }
    if (!essay.trim()) {
      setError("Please enter your essay.");
      return;
    }
    if (wordCount < minWords) {
      setError(
        `Your essay needs at least ${minWords} words. Current count: ${wordCount}.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, prompt, taskType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze essay");
      }

      router.push(`/essay/${data.essayId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  }, [essay, prompt, taskType, wordCount, minWords, router]);

  const taskPromptPlaceholders = {
    task1:
      "The chart below shows the percentage of households in different income groups in the UK from 1990 to 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2:
      "Some people believe that studying abroad is the best way to learn a language. Others, however, believe that it is better to study in your home country.\n\nDiscuss both views and give your own opinion.",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <PenLine className="h-7 w-7 text-indigo-600" />
          Submit Essay for Feedback
        </h1>
        <p className="text-slate-500 mt-1">
          Your essay will be analyzed by our AI examiner using official IELTS
          band descriptors.
        </p>
      </div>

      {/* Task Type Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Task Type</CardTitle>
          <CardDescription>
            Select whether this is a Task 1 (Academic/General) or Task 2 essay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
            {(["task1", "task2"] as TaskType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTaskType(type)}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  taskType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type === "task1" ? "Task 1" : "Task 2"}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {taskType === "task1"
              ? "Task 1: Describe a chart, graph, map, or diagram. Minimum 150 words."
              : "Task 2: Respond to a point of view, argument or problem. Minimum 250 words."}
          </p>
        </CardContent>
      </Card>

      {/* Task Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-semibold text-slate-700">
          Task Prompt *
        </Label>
        <p className="text-xs text-slate-500">
          Paste the exact IELTS question or task description here.
        </p>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={taskPromptPlaceholders[taskType]}
          className="min-h-[120px] resize-y text-sm"
          disabled={isSubmitting}
        />
      </div>

      {/* Essay */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="essay" className="text-sm font-semibold text-slate-700">
            Your Essay *
          </Label>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                isGood
                  ? "text-green-600"
                  : isUnderMin
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {wordCount} words
            </span>
            <Badge
              variant={
                isGood ? "success" : isUnderMin ? "error" : "warning"
              }
              className="text-xs"
            >
              {isGood
                ? "Good length"
                : isUnderMin
                ? `Min ${minWords} needed`
                : `Aim for ${recWords}+`}
            </Badge>
          </div>
        </div>

        {/* Word count progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isGood ? "bg-green-500" : isUnderMin ? "bg-red-400" : "bg-amber-400"
            }`}
            style={{
              width: `${Math.min((wordCount / recWords) * 100, 100)}%`,
            }}
          />
        </div>

        <Textarea
          id="essay"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={
            taskType === "task1"
              ? "The chart illustrates the changes in household income distribution across different groups in the United Kingdom between 1990 and 2020..."
              : "In recent decades, the question of whether studying in a foreign country provides greater language acquisition benefits than learning at home has generated considerable debate..."
          }
          className="min-h-[350px] resize-y text-sm leading-relaxed"
          disabled={isSubmitting}
        />
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-0.5">Analysis takes 15–30 seconds</p>
          <p className="text-blue-600">
            Our AI examiner carefully reads your essay against official IELTS band
            descriptors. Please be patient while it provides detailed feedback.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !prompt.trim() || !essay.trim()}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing with IELTS AI...
            </>
          ) : (
            "Submit for Feedback →"
          )}
        </Button>
      </div>
    </div>
  );
}
