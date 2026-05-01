"use client";

import {
  BookOpen, Sparkles, AlignLeft, CheckCircle2,
  Loader2, Zap, AlertTriangle, Repeat2,
  Link2, Shuffle, MessageSquareWarning, Target, Eye, LayoutTemplate,
} from "lucide-react";
import Link from "next/link";

export interface GuideSuggestion {
  type:
    | "grammar" | "vocabulary" | "repeated_words" | "cohesion"
    | "sentence_variety" | "formality" | "task" | "clarity" | "structure";
  tip: string;
  excerpt?: string | null;
}

interface GuidePanelProps {
  suggestions: GuideSuggestion[];
  isLoading: boolean;
  wordCount: number;
  isProUser: boolean;
  repeatedWords?: string[]; // client-side detected
}

const TYPE_CONFIG: Record<GuideSuggestion["type"], {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  grammar:          { label: "Grammar",          icon: CheckCircle2,         color: "text-red-600",      bg: "bg-red-50",      border: "border-red-100" },
  vocabulary:       { label: "Vocabulary",        icon: BookOpen,             color: "text-blue-600",     bg: "bg-blue-50",     border: "border-blue-100" },
  repeated_words:   { label: "Repeated Words",    icon: Repeat2,              color: "text-orange-500",   bg: "bg-orange-50",   border: "border-orange-100" },
  cohesion:         { label: "Cohesion",          icon: Link2,                color: "text-purple-600",   bg: "bg-purple-50",   border: "border-purple-100" },
  sentence_variety: { label: "Sentence Variety",  icon: Shuffle,              color: "text-teal-600",     bg: "bg-teal-50",     border: "border-teal-100" },
  formality:        { label: "Too Informal",       icon: MessageSquareWarning, color: "text-amber-600",    bg: "bg-amber-50",    border: "border-amber-100" },
  task:             { label: "Task Response",      icon: Target,               color: "text-brand-600",    bg: "bg-brand-50",    border: "border-brand-100" },
  clarity:          { label: "Clarity",            icon: Eye,                  color: "text-slate-600",    bg: "bg-slate-50",    border: "border-slate-200" },
  structure:        { label: "Structure",          icon: LayoutTemplate,       color: "text-green-700",    bg: "bg-green-50",    border: "border-green-100" },
};

function SuggestionCard({ s }: { s: GuideSuggestion }) {
  const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.grammar;
  const Icon = cfg.icon;
  return (
    <div className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.color}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
      </div>
      {s.excerpt && (
        <p className="text-[11px] text-slate-500 italic bg-white/70 rounded-lg px-2 py-1 mb-1.5 border border-white/80 line-clamp-2">
          "{s.excerpt}"
        </p>
      )}
      <p className="text-xs text-slate-700 leading-relaxed">{s.tip}</p>
    </div>
  );
}

export function GuidePanel({ suggestions, isLoading, wordCount, isProUser, repeatedWords = [] }: GuidePanelProps) {
  if (!isProUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px] text-center p-4">
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
          <Zap className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Guide Mode is Pro</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Real-time grammar, vocabulary, cohesion and task tips — like a tutor by your side.
          </p>
        </div>
        <Link
          href="/pricing"
          className="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  // Combine client-side repeated words + API suggestions
  const repeatedWordSuggestion: GuideSuggestion | null =
    repeatedWords.length > 0
      ? {
          type: "repeated_words",
          tip: `You've used ${repeatedWords.map(w => `"${w}"`).join(", ")} multiple times. Try synonyms to improve lexical resource.`,
          excerpt: null,
        }
      : null;

  const allSuggestions = [
    ...(repeatedWordSuggestion ? [repeatedWordSuggestion] : []),
    ...suggestions,
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
        <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800">AI Tutor</p>
          <p className="text-[10px] text-slate-400">Live feedback as you write</p>
        </div>
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500 shrink-0" />}
      </div>

      {/* Content */}
      {wordCount < 15 ? (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 text-center py-8">
          <p className="text-xs text-slate-400">Start writing your essay<br />and I'll give you live feedback…</p>
        </div>
      ) : isLoading && allSuggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          <p className="text-xs text-slate-400">Analysing your essay…</p>
        </div>
      ) : allSuggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 text-center py-8">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <p className="text-xs text-slate-500">Looking great — keep writing!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {allSuggestions.map((s, i) => <SuggestionCard key={i} s={s} />)}
          {isLoading && (
            <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 mt-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating…
            </p>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-300 text-center mt-auto pt-2">
        Updates a few seconds after you stop typing
      </p>
    </div>
  );
}

// ── Client-side repeated word detection (no API cost) ──────────────────────
const STOPWORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","that",
  "this","these","those","it","its","they","their","them","we","our","you",
  "your","he","she","his","her","i","my","me","by","from","as","so","if",
  "not","also","more","which","who","what","how","when","where","than","then",
  "there","here","about","into","through","after","before","between","each",
]);

export function detectRepeatedWords(essay: string, threshold = 3): string[] {
  const words = essay
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;

  return Object.entries(freq)
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}
