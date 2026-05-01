"use client";

import { BookOpen, Sparkles, AlignLeft, CheckCircle2, Loader2, Zap } from "lucide-react";
import Link from "next/link";

export interface GuideSuggestion {
  type: "grammar" | "vocabulary" | "structure" | "task";
  tip: string;
}

interface GuidePanelProps {
  suggestions: GuideSuggestion[];
  isLoading: boolean;
  wordCount: number;
  isProUser: boolean;
}

const TYPE_CONFIG = {
  grammar:    { label: "Grammar",    icon: CheckCircle2, color: "text-red-500",   bg: "bg-red-50",   border: "border-red-100" },
  vocabulary: { label: "Vocabulary", icon: BookOpen,     color: "text-blue-500",  bg: "bg-blue-50",  border: "border-blue-100" },
  structure:  { label: "Structure",  icon: AlignLeft,    color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
  task:       { label: "Task",       icon: Sparkles,     color: "text-brand-600", bg: "bg-brand-50", border: "border-brand-100" },
};

export function GuidePanel({ suggestions, isLoading, wordCount, isProUser }: GuidePanelProps) {
  if (!isProUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px] text-center p-6">
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
          <Zap className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Guide Mode is Pro</p>
          <p className="text-xs text-slate-500 mt-1">Real-time AI feedback as you write — like a tutor by your side.</p>
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
          <p className="text-xs text-slate-400">Start writing your essay and I'll give you live feedback…</p>
        </div>
      ) : isLoading && suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          <p className="text-xs text-slate-400">Analysing your essay…</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 text-center py-8">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <p className="text-xs text-slate-500">Looking good so far — keep writing!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 flex-1">
          {suggestions.map((s, i) => {
            const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.grammar;
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border} transition-all duration-300`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`h-3 w-3 shrink-0 ${cfg.color}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{s.tip}</p>
              </div>
            );
          })}
          {isLoading && (
            <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating…
            </p>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-300 text-center mt-auto">
        Updates a few seconds after you stop typing
      </p>
    </div>
  );
}
