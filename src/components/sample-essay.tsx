"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SampleEssayProps {
  essayId: string;
}

export function SampleEssay({ essayId }: SampleEssayProps) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [sample, setSample] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  async function generate() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/essays/${essayId}/sample`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSample(data.sample);
      setState("done");
    } catch {
      setError("Failed to generate model answer. Please try again.");
      setState("idle");
    }
  }

  // Paragraphs for rendering
  const paragraphs = sample?.split(/\n+/).filter(Boolean) ?? [];

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Model Answer</p>
            <p className="text-xs text-slate-500">Band 8–9 sample essay for this prompt</p>
          </div>
        </div>

        {state === "idle" && (
          <Button
            size="sm"
            onClick={generate}
            className="gap-1.5 bg-brand-600 hover:bg-brand-700 text-white border-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </Button>
        )}

        {state === "loading" && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            Writing…
          </div>
        )}

        {state === "done" && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            {collapsed ? (
              <><ChevronDown className="h-4 w-4" />Show</>
            ) : (
              <><ChevronUp className="h-4 w-4" />Hide</>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {state === "idle" && (
        <div className="px-5 py-6 text-center text-sm text-slate-400">
          See how a Band 8–9 candidate would answer this exact prompt.
        </div>
      )}

      {state === "loading" && (
        <div className="px-5 py-8 flex items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          Generating model answer…
        </div>
      )}

      {error && (
        <div className="px-5 py-4 text-sm text-red-600 bg-red-50">{error}</div>
      )}

      {state === "done" && !collapsed && (
        <div className="px-5 py-5 space-y-4">
          {/* Band badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="h-3 w-3" />
              Band 8–9 Model
            </span>
            <span className="text-xs text-slate-400">
              {paragraphs.length > 0 &&
                `${sample!.split(/\s+/).filter(Boolean).length} words`}
            </span>
          </div>

          {/* Essay text */}
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-3">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Regenerate */}
          <div className="pt-2 border-t border-[var(--border)]">
            <button
              onClick={generate}
              className="text-xs text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Generate another model answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
