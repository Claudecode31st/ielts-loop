"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, Loader2, PenLine, Info,
  ImagePlus, X, GraduationCap, BookOpen,
  Clock, AlertTriangle, EyeOff, Sparkles, Zap,
} from "lucide-react";
import { GuidePanel, detectRepeatedWords } from "@/components/guide-panel";
import type { GuideSuggestion } from "@/components/guide-panel";
import { countWords } from "@/lib/utils";
import type { TaskType } from "@/types";
import { EssayLimitBanner } from "@/components/essay-limit-banner";
import { GeneratedChart } from "@/components/generated-chart";
import type { ChartData } from "@/components/generated-chart";

const MIN_WORDS = { task1: 150, task2: 250 };
const RECOMMENDED_WORDS = { task1: 180, task2: 280 };
type IeltsMode = "academic" | "general";

interface UsageData {
  used: number;
  limit: number;
  plan: string;
}

export default function NewEssayPage() {
  const router = useRouter();
  const [ieltsMode, setIeltsMode] = useState<IeltsMode>("academic");
  const [taskType, setTaskType] = useState<TaskType>("task1");
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [showWordWarning, setShowWordWarning] = useState(false);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [promptUsage, setPromptUsage] = useState<{ used: number; limit: number | null } | null>(null);
  const [guideMode, setGuideMode] = useState(false);
  const [guideSuggestions, setGuideSuggestions] = useState<GuideSuggestion[]>([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [knownErrors, setKnownErrors] = useState<string[]>([]);
  const [repeatedWords, setRepeatedWords] = useState<string[]>([]);
  const lastAnalysedWordCount = useRef(0);
  const guideDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: UsageData) => setUsageData(data))
      .catch(() => {});
    fetch("/api/prompt")
      .then((r) => r.json())
      .then((data) => setPromptUsage({ used: data.used, limit: data.limit }))
      .catch(() => {});
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => setIsProUser(data.plan === "pro"))
      .catch(() => {});
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => {
        const patterns = (data.topErrorPatterns ?? []).slice(0, 6).map((e: { errorType: string }) => e.errorType);
        setKnownErrors(patterns);
      })
      .catch(() => {});
  }, []);

  const wordCount = countWords(essay);
  const minWords = MIN_WORDS[taskType];
  const recWords = RECOMMENDED_WORDS[taskType];
  const isUnderMin = essay.trim().length > 0 && wordCount < minWords;
  const isGood = wordCount >= recWords;

  // Elapsed timer
  useEffect(() => {
    if (isSubmitting) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSubmitting]);

  // Tab-switch warning during analysis
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isSubmitting) setTabWarning(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isSubmitting]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file (JPG, PNG, GIF, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageBase64(result.split(",")[1]);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
    setError(null);
  }, []);

  const removeImage = useCallback(() => {
    setImageBase64(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Guide mode: debounced analysis triggered by essay changes
  const triggerGuideAnalysis = useCallback((essayText: string) => {
    if (!guideMode) return;
    const words = essayText.trim().split(/\s+/).filter(Boolean).length;
    if (Math.abs(words - lastAnalysedWordCount.current) < 10) return; // need 10+ new words

    if (guideDebounceRef.current) clearTimeout(guideDebounceRef.current);
    guideDebounceRef.current = setTimeout(async () => {
      setGuideLoading(true);
      try {
        const res = await fetch("/api/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ essay: essayText, prompt, taskType, ieltsMode, knownErrors }),
        });
        const data = await res.json();
        if (res.ok && data.suggestions) {
          setGuideSuggestions(data.suggestions);
          lastAnalysedWordCount.current = words;
        }
      } catch { /* silent */ } finally {
        setGuideLoading(false);
      }
    }, 4000); // 4 seconds after typing stops
  }, [guideMode, prompt, taskType, ieltsMode]);

  // Warn before switching if a prompt was already generated
  const confirmSwitch = useCallback((onConfirm: () => void) => {
    if (!prompt.trim()) { onConfirm(); return; }
    if (window.confirm("Switching will clear the current prompt and chart. Continue?")) {
      onConfirm();
    }
  }, [prompt]);

  const generatePrompt = useCallback(async () => {
    setIsGeneratingPrompt(true);
    setError(null);
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType, ieltsMode }),
      });
      const data = await res.json();
      if (res.status === 429) { setError(data.error); return; }
      if (!res.ok) throw new Error(data.error);
      setPrompt(data.prompt);
      setChartData(data.chartData ?? null);
      if (data.used != null) setPromptUsage({ used: data.used, limit: data.limit });
    } catch {
      setError("Failed to generate prompt. Please try again.");
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [taskType, ieltsMode]);

  const doSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    setShowWordWarning(false);
    setTabWarning(false);

    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay, prompt, taskType, ieltsMode,
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
  }, [essay, prompt, taskType, ieltsMode, imageBase64, imageMime, router]);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) { setError("Please enter the task prompt."); return; }
    if (!essay.trim()) { setError("Please enter your essay."); return; }
    // Soft warning for under-minimum — don't hard block
    if (wordCount < minWords && !showWordWarning) {
      setShowWordWarning(true);
      return;
    }
    doSubmit();
  }, [prompt, essay, wordCount, minWords, showWordWarning, doSubmit]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const taskPromptPlaceholders = {
    task1: ieltsMode === "academic"
      ? "The chart below shows the percentage of households in different income groups in the UK from 1990 to 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant."
      : "You recently stayed at a hotel and were unhappy with the service. Write a letter to the hotel manager.\n– describe where you stayed and when\n– explain what the problem was\n– say what you would like the hotel to do",
    task2: "Some people believe that studying abroad is the best way to learn a language. Others believe it is better to study in your home country.\n\nDiscuss both views and give your own opinion.",
  };

  const task1Label = ieltsMode === "academic"
    ? "Task 1 Academic: Describe a chart, graph, map, or diagram. Min 150 words."
    : "Task 1 General: Write a letter (formal, semi-formal, or informal). Min 150 words.";

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-8">
        {/* Tab warning banner */}
        {tabWarning && (
          <div className="w-full flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <EyeOff className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Don't switch tabs!</p>
              <p className="text-amber-700">Your analysis is still running. Switching tabs may slow it down. Please keep this tab active.</p>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Animated ring */}
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PenLine className="h-8 w-8 text-brand-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Analysing your essay…</h2>
            <p className="text-slate-500 text-sm max-w-sm">
              Our AI examiner is scoring your essay against official IELTS band descriptors and building your memory profile.
            </p>
          </div>

          {/* Live timer */}
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/70 rounded-xl px-5 py-3 shadow-md">
            <Clock className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium text-slate-700">Time elapsed:</span>
            <span className="text-lg font-bold text-brand-600 tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Progress steps */}
          <div className="w-full max-w-sm space-y-2 text-left">
            {[
              { label: "Reading essay & task prompt", done: elapsedSeconds > 3 },
              { label: "Scoring all 4 IELTS criteria", done: elapsedSeconds > 8 },
              { label: "Identifying error patterns", done: elapsedSeconds > 14 },
              { label: "Updating your memory profile", done: elapsedSeconds > 20 },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full shrink-0 transition-colors duration-500 ${done ? "bg-green-500" : "bg-slate-200"}`} />
                <span className={`text-sm transition-colors duration-500 ${done ? "text-slate-700 font-medium" : "text-slate-400"}`}>{label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">Keep this tab open · Usually takes 15–25 seconds</p>
        </div>

        {/* Error during submission */}
        {error && (
          <div className="w-full flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  const isAtLimit =
    usageData !== null &&
    usageData.plan !== "pro" &&
    usageData.used >= usageData.limit;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <PenLine className="h-7 w-7 text-brand-600" />
          Submit Essay for Feedback
        </h1>
        <p className="text-slate-500 mt-1">Analysed by our AI examiner using official IELTS band descriptors.</p>
      </div>

      {/* Usage banner */}
      {usageData && (
        <EssayLimitBanner
          used={usageData.used}
          limit={usageData.limit}
          plan={usageData.plan}
        />
      )}

      {/* Exam Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exam Settings</CardTitle>
          <CardDescription>Choose your IELTS type and task.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">IELTS Type</p>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden w-fit">
              {(["academic", "general"] as IeltsMode[]).map((mode) => (
                <button key={mode} onClick={() => confirmSwitch(() => { setIeltsMode(mode); setChartData(null); setPrompt(""); })}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 ${ieltsMode === mode ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {mode === "academic" ? <><GraduationCap className="h-4 w-4" /> Academic</> : <><BookOpen className="h-4 w-4" /> General Training</>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Task</p>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden w-fit">
              {(["task1", "task2"] as TaskType[]).map((type) => (
                <button key={type} onClick={() => confirmSwitch(() => { setTaskType(type); setShowWordWarning(false); setChartData(null); setPrompt(""); })}
                  className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 ${taskType === type ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
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
              <ImagePlus className="h-5 w-5 text-brand-500" />
              Chart / Graph Image
              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
            </CardTitle>
            <CardDescription>Upload the chart, graph, map, or diagram. The AI will analyse it alongside your essay for more accurate feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            {imagePreview ? (
              <div className="relative w-full">
                <img src={imagePreview} alt="Uploaded chart" className="max-h-64 rounded-xl border border-slate-200 object-contain w-full bg-slate-50" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-slate-200 hover:bg-red-50 transition-colors">
                  <X className="h-4 w-4 text-slate-500 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-xl bg-slate-50 hover:bg-brand-50 transition-colors cursor-pointer border border-slate-200 hover:border-brand-300">
                <ImagePlus className="h-8 w-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, GIF, WEBP · Max 5MB</p>
                </div>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </CardContent>
        </Card>
      )}

      {/* Task Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label htmlFor="prompt" className="text-sm font-semibold text-slate-700">Task Prompt *</Label>
            <p className="text-xs text-slate-500 mt-0.5">Paste the exact IELTS question, or generate one to practice with.</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generatePrompt}
              disabled={isGeneratingPrompt}
              className="gap-1.5 border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300"
            >
              {isGeneratingPrompt
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</>
                : <><Sparkles className="h-3.5 w-3.5" />Generate Prompt</>
              }
            </Button>
            {promptUsage && (
              <p className="text-[10px] text-slate-400">
                {promptUsage.limit === null
                  ? "Unlimited (Pro)"
                  : `${promptUsage.used} / ${promptUsage.limit} this month`}
              </p>
            )}
          </div>
        </div>
        <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder={taskPromptPlaceholders[taskType]} className="min-h-[120px] resize-y text-sm" />

        {/* Generated chart for Task 1 Academic */}
        {chartData && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-[var(--border)] shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Generated Chart</p>
            <GeneratedChart data={chartData} />
          </div>
        )}
      </div>

      {/* Essay */}
      {/* Essay + Guide Mode */}
      <div className="space-y-2">
        {/* Header row: label + word count + guide toggle */}
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="essay" className="text-sm font-semibold text-slate-700">Your Essay *</Label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isGood ? "text-green-600" : isUnderMin ? "text-amber-500" : "text-slate-500"}`}>{wordCount} words</span>
              <Badge variant={isGood ? "success" : isUnderMin ? "warning" : "outline"} className="text-xs">
                {isGood ? "Good length" : isUnderMin ? `Min ${minWords} recommended` : `Aim for ${recWords}+`}
              </Badge>
            </div>
            {/* Guide mode toggle */}
            <button
              type="button"
              onClick={() => { setGuideMode((m) => !m); setGuideSuggestions([]); lastAnalysedWordCount.current = 0; }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                guideMode
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Guide Mode
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${isGood ? "bg-green-500" : isUnderMin ? "bg-amber-400" : "bg-slate-300"}`}
            style={{ width: `${Math.min((wordCount / recWords) * 100, 100)}%` }} />
        </div>

        {/* 2-column layout when guide mode is on */}
        <div className={`flex gap-4 items-start transition-all duration-300`}>
          <div className={`flex-1 min-w-0 transition-all duration-300`}>
            <Textarea
              id="essay"
              value={essay}
              placeholder={taskType === "task1" ? (ieltsMode === "academic" ? "The chart illustrates…" : "Dear Sir or Madam,\n\nI am writing to…") : "In recent decades…"}
              className="min-h-[350px] resize-y text-sm leading-relaxed w-full"
              onChange={(e) => {
                setEssay(e.target.value);
                setShowWordWarning(false);
                triggerGuideAnalysis(e.target.value);
                if (guideMode) setRepeatedWords(detectRepeatedWords(e.target.value));
              }}
            />
          </div>

          {/* Guide panel — slides in when guide mode is on */}
          {guideMode && (
            <div className="w-72 shrink-0 bg-white rounded-2xl border border-[var(--border)] shadow-sm p-4 self-stretch min-h-[350px] flex flex-col">
              <GuidePanel
                suggestions={guideSuggestions}
                isLoading={guideLoading}
                wordCount={wordCount}
                isProUser={isProUser}
                repeatedWords={repeatedWords}
              />
            </div>
          )}
        </div>
      </div>

      {/* Word count soft warning */}
      {showWordWarning && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold text-amber-800">Your essay is below the recommended minimum</p>
              <p className="text-sm text-amber-700 mt-0.5">
                You have <strong>{wordCount} words</strong> — IELTS {taskType === "task1" ? "Task 1" : "Task 2"} recommends at least <strong>{minWords} words</strong>.
                A short essay will likely score lower on Task Achievement.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowWordWarning(false)} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Go back and write more
              </Button>
              <Button size="sm" onClick={doSubmit} className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                Submit anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-[var(--border)]">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-500">
          <p className="font-medium mb-0.5 text-slate-600">Keep this tab open during analysis</p>
          <p>Analysis usually takes 15–25 seconds. Switching tabs may slow it down.</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || !essay.trim() || isAtLimit}
          className="min-w-[200px]"
          title={isAtLimit ? "Upgrade to Pro to submit more essays" : undefined}
        >
          Analyse My Essay →
        </Button>
      </div>
    </div>
  );
}
