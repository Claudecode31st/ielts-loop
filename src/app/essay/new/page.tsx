"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertCircle, Loader2, PenLine, Info,
  ImagePlus, X, GraduationCap, BookOpen,
  Clock, AlertTriangle, EyeOff, Sparkles, Zap, CheckCircle2,
} from "lucide-react";
import { GuidePanel, detectRepeatedWords } from "@/components/guide-panel";
import type { GuideSuggestion, BandScores } from "@/components/guide-panel";
import { countWords } from "@/lib/utils";
import type { TaskType } from "@/types";
import { EssayLimitBanner } from "@/components/essay-limit-banner";
import { GeneratedChart } from "@/components/generated-chart";
import type { ChartData } from "@/components/generated-chart";

const MIN_WORDS = { task1: 150, task2: 250 };
const RECOMMENDED_WORDS = { task1: 180, task2: 280 };
type IeltsMode = "academic" | "general";

interface UsageData { used: number; limit: number; plan: string; }

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
  const [bandScores, setBandScores] = useState<BandScores | null>(null);
  const lastAnalysedWordCount = useRef(0);
  const guideDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/usage").then(r => r.json()).then((d: UsageData) => { setUsageData(d); setIsProUser(d.plan === "pro"); }).catch(() => {});
    fetch("/api/prompt").then(r => r.json()).then(d => setPromptUsage({ used: d.used, limit: d.limit })).catch(() => {});
    fetch("/api/memory").then(r => r.json()).then(d => setKnownErrors((d.topErrorPatterns ?? []).slice(0, 6).map((e: { errorType: string }) => e.errorType))).catch(() => {});
  }, []);

  const wordCount = countWords(essay);
  const minWords = MIN_WORDS[taskType];
  const recWords = RECOMMENDED_WORDS[taskType];
  const isUnderMin = essay.trim().length > 0 && wordCount < minWords;
  const isGood = wordCount >= recWords;

  useEffect(() => {
    if (isSubmitting) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSubmitting]);

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden && isSubmitting) setTabWarning(true); };
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

  const triggerGuideAnalysis = useCallback((essayText: string) => {
    if (!guideMode) return;
    const words = essayText.trim().split(/\s+/).filter(Boolean).length;
    if (Math.abs(words - lastAnalysedWordCount.current) < 10) return;
    if (guideDebounceRef.current) clearTimeout(guideDebounceRef.current);
    guideDebounceRef.current = setTimeout(async () => {
      setGuideLoading(true);
      try {
        const res = await fetch("/api/guide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ essay: essayText, prompt, taskType, ieltsMode, knownErrors }) });
        const data = await res.json();
        if (res.ok && data.suggestions) { setGuideSuggestions(data.suggestions); if (data.bandScores) setBandScores(data.bandScores); lastAnalysedWordCount.current = words; }
      } catch { /* silent */ } finally { setGuideLoading(false); }
    }, 4000);
  }, [guideMode, prompt, taskType, ieltsMode, knownErrors]);

  const confirmSwitch = useCallback((onConfirm: () => void) => {
    if (!prompt.trim()) { onConfirm(); return; }
    if (window.confirm("Switching will clear the current prompt and chart. Continue?")) onConfirm();
  }, [prompt]);

  const generatePrompt = useCallback(async () => {
    setIsGeneratingPrompt(true); setError(null);
    try {
      const res = await fetch("/api/prompt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskType, ieltsMode }) });
      const data = await res.json();
      if (res.status === 429) { setError(data.error); return; }
      if (!res.ok) throw new Error(data.error);
      setPrompt(data.prompt); setChartData(data.chartData ?? null);
      if (data.used != null) setPromptUsage({ used: data.used, limit: data.limit });
    } catch { setError("Failed to generate prompt. Please try again."); }
    finally { setIsGeneratingPrompt(false); }
  }, [taskType, ieltsMode]);

  const doSubmit = useCallback(async () => {
    setIsSubmitting(true); setError(null); setShowWordWarning(false); setTabWarning(false);
    try {
      const res = await fetch("/api/essays", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ essay, prompt, taskType, ieltsMode, imageBase64: imageBase64 ?? undefined, imageMime: imageBase64 ? imageMime : undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze essay");
      router.push(`/essay/${data.essayId}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); setIsSubmitting(false); }
  }, [essay, prompt, taskType, ieltsMode, imageBase64, imageMime, router]);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) { setError("Please enter the task prompt."); return; }
    if (!essay.trim()) { setError("Please enter your essay."); return; }
    if (wordCount < minWords && !showWordWarning) { setShowWordWarning(true); return; }
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
    ? "Describe a chart, graph, map, or diagram. Min 150 words."
    : "Write a letter (formal, semi-formal, or informal). Min 150 words.";

  const isAtLimit = usageData !== null && usageData.plan !== "pro" && usageData.used >= usageData.limit;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-8">
        {tabWarning && (
          <div className="w-full flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <EyeOff className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Don't switch tabs!</p>
              <p className="text-amber-700">Your analysis is still running. Please keep this tab active.</p>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PenLine className="h-8 w-8 text-brand-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Analysing your essay…</h2>
            <p className="text-slate-500 text-sm max-w-sm">Scoring against official IELTS band descriptors and updating your memory profile.</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
            <Clock className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium text-slate-700">Time elapsed:</span>
            <span className="text-lg font-bold text-brand-600 tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>
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
        {error && (
          <div className="w-full flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PenLine className="h-5 w-5 text-brand-600 shrink-0" />
            Submit Essay for Feedback
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Scored by AI against official IELTS band descriptors.</p>
        </div>
        {usageData && (
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600">
            <CheckCircle2 className={`h-3.5 w-3.5 ${usageData.plan === "pro" ? "text-brand-600" : "text-slate-400"}`} />
            {usageData.plan === "pro" ? "Pro" : `${usageData.used} / ${usageData.limit} essays used`}
          </div>
        )}
      </div>

      {/* Usage banner (limit reached) */}
      {usageData && isAtLimit && (
        <EssayLimitBanner used={usageData.used} limit={usageData.limit} plan={usageData.plan} />
      )}

      {/* ── Settings row ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        {/* IELTS Type */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
          {(["academic", "general"] as IeltsMode[]).map((mode) => (
            <button key={mode} onClick={() => confirmSwitch(() => { setIeltsMode(mode); setChartData(null); setPrompt(""); })}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 font-medium transition-colors ${ieltsMode === mode ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {mode === "academic" ? <><GraduationCap className="h-3.5 w-3.5" />Academic</> : <><BookOpen className="h-3.5 w-3.5" />General</>}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Task */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
          {(["task1", "task2"] as TaskType[]).map((type) => (
            <button key={type} onClick={() => confirmSwitch(() => { setTaskType(type); setShowWordWarning(false); setChartData(null); setPrompt(""); })}
              className={`px-4 py-1.5 font-medium transition-colors ${taskType === type ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {type === "task1" ? "Task 1" : "Task 2"}
            </button>
          ))}
        </div>

        {/* Task description */}
        <p className="text-xs text-slate-400">
          {taskType === "task1" ? task1Label : "Respond to a point of view or argument. Min 250 words."}
        </p>
      </div>

      {/* ── Image Upload (Task 1 Academic only) ── */}
      {taskType === "task1" && ieltsMode === "academic" && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <ImagePlus className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Chart / Graph Image</span>
            <span className="text-[10px] font-medium text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">Optional</span>
          </div>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Uploaded chart" className="max-h-48 rounded-lg border border-slate-200 object-contain w-full bg-slate-50" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-slate-200 hover:bg-red-50 transition-colors">
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-lg bg-slate-50 hover:bg-brand-50 transition-colors border border-slate-200 hover:border-brand-300">
              <ImagePlus className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-500">Click to upload <span className="text-slate-400 text-xs">· JPG, PNG, GIF, WEBP · Max 5MB</span></span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      )}

      {/* ── Task Prompt ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Task Prompt <span className="text-brand-600">*</span></label>
            <p className="text-xs text-slate-400 mt-0.5">Paste the exact IELTS question, or generate one to practise with.</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button onClick={generatePrompt} disabled={isGeneratingPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-200 text-brand-700 text-xs font-semibold hover:bg-brand-50 hover:border-brand-300 transition-colors disabled:opacity-50">
              {isGeneratingPrompt ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</> : <><Sparkles className="h-3.5 w-3.5" />Generate Prompt</>}
            </button>
            {promptUsage && (
              <p className="text-[10px] text-slate-400">
                {promptUsage.limit === null ? "Unlimited (Pro)" : `${promptUsage.used} / ${promptUsage.limit} this month`}
              </p>
            )}
          </div>
        </div>
        <Textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder={taskPromptPlaceholders[taskType]} className="min-h-[100px] resize-y text-sm" />
        {chartData && (
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Generated Chart</p>
            <GeneratedChart data={chartData} />
          </div>
        )}
      </div>

      {/* ── Essay ── */}
      <div className="space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-semibold text-slate-700">Your Essay <span className="text-brand-600">*</span></label>
          <div className="flex items-center gap-2">
            {/* Word count */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              isGood ? "border-green-200 bg-green-50 text-green-700"
              : isUnderMin ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
            }`}>
              {wordCount} / {recWords}+ words
            </span>
            {/* Guide mode */}
            <button type="button"
              onClick={() => { setGuideMode(m => !m); setGuideSuggestions([]); setBandScores(null); lastAnalysedWordCount.current = 0; }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                guideMode ? "bg-brand-600 text-white border-brand-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700"
              }`}>
              <Zap className="h-3 w-3" />
              Guide Mode
              {!isProUser && <span className="text-[9px] opacity-60">Pro</span>}
            </button>
          </div>
        </div>

        {/* Word count progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1">
          <div className={`h-1 rounded-full transition-all duration-300 ${isGood ? "bg-green-500" : isUnderMin ? "bg-amber-400" : "bg-slate-300"}`}
            style={{ width: `${Math.min((wordCount / recWords) * 100, 100)}%` }} />
        </div>

        {/* Essay + Guide panel side by side */}
        <div className="flex gap-3 items-start">
          <Textarea id="essay" value={essay}
            placeholder={taskType === "task1" ? (ieltsMode === "academic" ? "The chart illustrates…" : "Dear Sir or Madam,\n\nI am writing to…") : "In recent decades…"}
            className="flex-1 min-h-[320px] resize-y text-sm leading-relaxed"
            onChange={e => {
              setEssay(e.target.value);
              setShowWordWarning(false);
              triggerGuideAnalysis(e.target.value);
              if (guideMode) setRepeatedWords(detectRepeatedWords(e.target.value));
            }}
          />
          {guideMode && (
            <div className="w-68 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-3 self-stretch min-h-[320px] flex flex-col">
              <GuidePanel suggestions={guideSuggestions} isLoading={guideLoading} wordCount={wordCount} isProUser={isProUser} repeatedWords={repeatedWords} bandScores={bandScores} />
            </div>
          )}
        </div>
      </div>

      {/* ── Word count warning ── */}
      {showWordWarning && (
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Below recommended minimum</p>
            <p className="text-xs text-amber-700 mt-0.5">{wordCount} words — IELTS {taskType === "task1" ? "Task 1" : "Task 2"} recommends at least {minWords}. A short essay typically scores lower on Task Achievement.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowWordWarning(false)} className="text-xs font-medium text-amber-700 hover:underline">Write more</button>
            <button onClick={doSubmit} className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1 rounded-lg transition-colors">Submit anyway</button>
          </div>
        </div>
      )}

      {/* ── Info note ── */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Info className="h-3.5 w-3.5 shrink-0" />
        Keep this tab open during analysis · Usually takes 15–25 seconds
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" size="sm" onClick={() => router.back()}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={!prompt.trim() || !essay.trim() || isAtLimit}
          className="min-w-[160px]" title={isAtLimit ? "Upgrade to Pro to submit more essays" : undefined}>
          Analyse My Essay →
        </Button>
      </div>
    </div>
  );
}
