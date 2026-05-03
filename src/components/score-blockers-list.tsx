"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, ArrowRight, XCircle, CheckCircle2 } from "lucide-react";

interface ErrorExample {
  essayId: string;
  text: string;
  correction: string;
}

interface ScoreBlocker {
  id: string;
  errorType: string;
  errorCategory: string;
  description: string;
  frequency: number | null;
  examples: ErrorExample[] | null;
}

interface Props {
  errors: ScoreBlocker[];
}

function catLabel(cat: string) {
  return cat === "grammar" ? "Grammar" : cat === "vocabulary" ? "Vocabulary" : cat === "structure" ? "Coherence" : "Task";
}
function catColor(cat: string) {
  return cat === "grammar"
    ? { badge: "bg-red-50 text-red-600 border-red-100", bar: "bg-red-400" }
    : cat === "vocabulary"
    ? { badge: "bg-amber-50 text-amber-600 border-amber-100", bar: "bg-amber-400" }
    : cat === "structure"
    ? { badge: "bg-blue-50 text-blue-600 border-blue-100", bar: "bg-blue-400" }
    : { badge: "bg-emerald-50 text-emerald-600 border-emerald-100", bar: "bg-emerald-400" };
}
function impactConfig(freq: number): { label: string; color: string } | null {
  if (freq >= 5) return { label: "Recurring",  color: "text-slate-600 bg-slate-50 border-slate-200"  };
  if (freq >= 3) return { label: "Pattern",    color: "text-slate-600 bg-slate-50 border-slate-200"  };
  if (freq >= 2) return { label: "Repeat",     color: "text-slate-600 bg-slate-50 border-slate-200"  };
  return null; // ×1 on the bar already says it — no redundant badge needed
}
const CATEGORY_TIPS: Record<string, string> = {
  grammar:    "Fixing this will improve your Grammar score.",
  vocabulary: "Fixing this will improve your Vocabulary score.",
  structure:  "Fixing this will improve your Coherence & Cohesion score.",
  coherence:  "Fixing this will improve your Coherence & Cohesion score.",
};

export function ScoreBlockersList({ errors }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="p-3 space-y-2">
      {/* Badge legend */}
      <div className="flex items-center gap-3 px-1 pb-1 flex-wrap">
        {[
          { label: "Repeat",    desc: "seen in 2 essays",  color: "text-slate-600 bg-slate-50 border-slate-200"   },
          { label: "Pattern",   desc: "3–4 essays",        color: "text-slate-600 bg-slate-50 border-slate-200"   },
          { label: "Recurring", desc: "5+ essays",         color: "text-slate-600 bg-slate-50 border-slate-200"   },
        ].map(({ label, desc, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-1.5 py-px rounded border ${color}`}>{label}</span>
            <span className="text-[10px] text-slate-400">= {desc}</span>
          </div>
        ))}
      </div>

      {errors.map((error, idx) => {
        const freq     = error.frequency ?? 1;
        const barPct   = Math.min(100, freq * 10);
        const cc       = catColor(error.errorCategory);
        const imp      = impactConfig(freq);
        const tip      = CATEGORY_TIPS[error.errorCategory] ?? "This pattern is reducing your overall band score.";
        const isOpen   = openId === error.id;
        const examples = error.examples ?? [];

        return (
          <div
            key={error.id}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-brand-200 shadow-sm bg-white"
                : "border-[var(--border)] bg-white hover:border-slate-300"
            }`}
          >
            {/* Header row — clickable */}
            <button
              onClick={() => setOpenId(isOpen ? null : error.id)}
              className="w-full text-left px-4 py-3.5"
            >
              <div className="flex items-start gap-3">
                {/* Rank */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                  isOpen ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-500"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-slate-800 capitalize">{error.errorType}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-px rounded border ${cc.badge}`}>{catLabel(error.errorCategory)}</span>
                    {imp && <span className={`text-[10px] font-semibold px-1.5 py-px rounded border ${imp.color}`}>{imp.label}</span>}
                  </div>
                  {/* Tip */}
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{tip}</p>
                  {/* Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cc.bar} transition-all duration-500`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 tabular-nums shrink-0 w-7 text-right">×{freq}</span>
                  </div>
                </div>
                {/* Expand chevron */}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 mt-1 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-brand-500" : "text-slate-300"
                  }`}
                />
              </div>
            </button>

            {/* Expanded panel */}
            {isOpen && (
              <div className="px-4 pb-4 border-t border-brand-100 bg-slate-50/50">
                {/* Description */}
                <div className="pt-3 pb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">What this means</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{error.description}</p>
                </div>

                {/* Examples */}
                {examples.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      From your essays ({examples.length} example{examples.length > 1 ? "s" : ""})
                    </p>
                    <div className="space-y-2">
                      {examples.map((ex, i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-slate-200">
                          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-red-50 border-b border-red-100">
                            <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 leading-relaxed">{ex.text}</p>
                          </div>
                          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-emerald-50">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-700 leading-relaxed">{ex.correction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {examples.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No specific examples recorded yet — submit more essays to see excerpts.</p>
                )}

                {/* CTA */}
                <Link
                  href={`/exercises?focus=${encodeURIComponent(error.errorType)}`}
                  className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors pt-3 border-t border-slate-200"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Practice fixing {error.errorType}
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
