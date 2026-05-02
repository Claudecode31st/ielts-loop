"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, Loader2, Sparkles } from "lucide-react";

export function RebuildMemoryButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  async function handleRebuild() {
    if (state === "loading") return;
    setState("loading");
    setShowTooltip(false);
    try {
      const res = await fetch("/api/memory/rebuild", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCount(data.essaysReprocessed ?? 0);
      setState("done");
      setTimeout(() => window.location.reload(), 1800);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
        Updated from {count} essay{count !== 1 ? "s" : ""} — refreshing…
      </div>
    );
  }

  if (state === "error") {
    return (
      <span className="text-xs text-red-600 font-medium">Update failed — try again</span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleRebuild}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={state === "loading"}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors disabled:opacity-50"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating insights…
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            Recalculate
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && state === "idle" && (
        <div className="absolute right-0 top-6 z-50 w-72 p-3.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs leading-relaxed">
          <p className="font-semibold mb-1.5">Recalculate Score Blockers</p>
          <p className="text-slate-300">
            If your score blockers or error patterns look incorrect or outdated,
            this re-reads all your past essays and rebuilds them from scratch.
          </p>
          <p className="text-slate-400 mt-2">
            New essays are always processed automatically — you only need this
            if something looks wrong.
          </p>
          <div className="absolute -top-1.5 right-3 w-3 h-3 bg-slate-900 rotate-45 rounded-sm" />
        </div>
      )}
    </div>
  );
}
