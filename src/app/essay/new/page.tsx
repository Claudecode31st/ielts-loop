"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, Loader2, PenLine, Info,
  ImagePlus, X, GraduationCap, BookOpen,
} from "lucide-react";
import { countWords } from "@/lib/utils";
import type { TaskType } from "@/types";

const MIN_WORDS = { task1: 150, task2: 250 };
const RECOMMENDED_WORDS = { task1: 180, task2: 280 };

type IeltsMode = "academic" | "general";

export default function NewEssayPage() {
  const router = useRouter();
  const [ieltsMode, setIeltsMode] = useState<IeltsMode>("academic");
  const [taskType, setTaskType] = useState<TaskType>("task2");
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(essay);
  const minWords = MIN_WORDS[taskType];
  const recWords = RECOMMENDED_WORDS[taskType];
  const isUnderMin = essay.trim().length > 0 && wordCount < minWords;
  const isGood = wordCount >= recWords;

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, GIF, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result is data:image/xxx;base64,XXXX — extract base64 only
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
    setError(null);
  }, []);

  const removeImage = useCallback(() => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) { setError("Please enter the task prompt."); return; }
    if (!essay.trim()) { setError("Please enter your essay."); return; }
    if (wordCount < minWords) {
      setError(`Your essay needs at least ${minWords} words. Current count: ${wordCount}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay,
          prompt,
          taskType,
          ieltsMode,
          imageBase64: imageBase64 ?? undefined,
          imageMime: imageBase64 ? imageMime : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze essay");
      router.push(`/essay/${data.essayId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }, [essay, prompt, taskType, ieltsMode, wordCount, minWords, imageBase64, imageMime, router]);

  const taskPromptPlaceholders = {
    task1: ieltsMode === "academic"
      ? "The chart below shows the percentage of households in different income groups in the UK from 1990 to 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant."
      : "You recently stayed at a hotel and were unhappy with the service. Write a letter to the hotel manager. In your letter:\n– describe where you stayed and when\n– explain what the problem was\n– say what you would like the hotel to do",
    task2:
      "Some people believe that studying abroad is the best way to learn a language. Others, however, believe that it is better to study in your home country.\n\nDiscuss both views and give your own opinion.",
  };

  const task1Label = ieltsMode === "academic"
    ? "Task 1 Academic: Describe a chart, graph, map, or diagram. Min 150 words."
    : "Task 1 General: Write a letter (formal, semi-formal, or informal). Min 150 words.";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <PenLine className="h-7 w-7 text-indigo-600" />
          Submit Essay for Feedback
        </h1>
        <p className="text-slate-500 mt-1">
          Analysed by our AI examiner using official IELTS band descriptors.
        </p>
      </div>

      {/* IELTS Mode + Task Type — combined card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exam Settings</CardTitle>
          <CardDescription>Choose your IELTS type and task.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic / General toggle */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">IELTS Type</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
              {(["academic", "general"] as IeltsMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setIeltsMode(mode)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                    ieltsMode === mode
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {mode === "academic"
                    ? <><GraduationCap className="h-4 w-4" /> Academic</>
                    : <><BookOpen className="h-4 w-4" /> General Training</>}
                </button>
              ))}
            </div>
          </div>

          {/* Task 1 / Task 2 toggle */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Task</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
              {(["task1", "task2"] as TaskType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTaskType(type)}
                  className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                    taskType === type
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type === "task1" ? "Task 1" : "Task 2"}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">{taskType === "task1" ? task1Label : "Task 2: Respond to a point of view, argument or problem. Min 250 words."}</p>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload — Task 1 Academic only */}
      {taskType === "task1" && ieltsMode === "academic" && (
        <Card className="border-dashed border-2 border-slate-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-indigo-500" />
              Chart / Graph Image
              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
            </CardTitle>
            <CardDescription>
              Upload the chart, graph, map, or diagram from your exam paper. The AI will analyse it alongside your essay for more accurate feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imagePreview ? (
              <div className="relative w-full">
                <img
                  src={imagePreview}
                  alt="Uploaded chart"
                  className="max-h-64 rounded-lg border border-slate-200 object-contain w-full bg-slate-50"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-slate-200 hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors cursor-pointer border border-slate-200 hover:border-indigo-300"
              >
                <ImagePlus className="h-8 w-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, GIF, WEBP · Max 5MB</p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </CardContent>
        </Card>
      )}

      {/* Task Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-semibold text-slate-700">
          Task Prompt *
        </Label>
        <p className="text-xs text-slate-500">Paste the exact IELTS question or task description here.</p>
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
          <Label htmlFor="essay" className="text-sm font-semibold text-slate-700">Your Essay *</Label>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isGood ? "text-green-600" : isUnderMin ? "text-red-500" : "text-amber-500"}`}>
              {wordCount} words
            </span>
            <Badge variant={isGood ? "success" : isUnderMin ? "error" : "warning"} className="text-xs">
              {isGood ? "Good length" : isUnderMin ? `Min ${minWords} needed` : `Aim for ${recWords}+`}
            </Badge>
          </div>
        </div>

        {/* Word count bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isGood ? "bg-green-500" : isUnderMin ? "bg-red-400" : "bg-amber-400"}`}
            style={{ width: `${Math.min((wordCount / recWords) * 100, 100)}%` }}
          />
        </div>

        <Textarea
          id="essay"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={
            taskType === "task1"
              ? ieltsMode === "academic"
                ? "The chart illustrates the changes in household income distribution across different groups in the United Kingdom between 1990 and 2020..."
                : "Dear Sir or Madam,\n\nI am writing to express my dissatisfaction with the service I received during my recent stay at your hotel..."
              : "In recent decades, the question of whether studying in a foreign country provides greater language acquisition benefits than learning at home has generated considerable debate..."
          }
          className="min-h-[350px] resize-y text-sm leading-relaxed"
          disabled={isSubmitting}
        />
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-0.5">Analysis takes 15–30 seconds</p>
          <p className="text-blue-600">
            Our AI examiner carefully reads your essay against official IELTS band descriptors.
            {taskType === "task1" && ieltsMode === "academic" && imageBase64 && " Your uploaded chart will be analysed together with your essay."}
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
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !prompt.trim() || !essay.trim()}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing with IELTS AI...</>
          ) : (
            "Submit for Feedback →"
          )}
        </Button>
      </div>
    </div>
  );
}
