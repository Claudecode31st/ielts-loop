"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Loader2 } from "lucide-react";

export function RebuildMemoryButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(0);

  async function handleRebuild() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/memory/rebuild", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCount(data.essaysReprocessed ?? 0);
      setState("done");
      // Reload the page after a short delay so the dashboard reflects the fix
      setTimeout(() => window.location.reload(), 1800);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
        <CheckCircle className="h-4 w-4 text-green-500" />
        Rebuilt from {count} essay{count !== 1 ? "s" : ""} — refreshing…
      </div>
    );
  }

  if (state === "error") {
    return (
      <span className="text-sm text-red-600">Failed — try again</span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRebuild}
      disabled={state === "loading"}
      className="gap-2 border-brand-300 text-brand-700 hover:bg-brand-50 rounded-xl text-xs"
    >
      {state === "loading" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Rebuilding…
        </>
      ) : (
        <>
          <RefreshCw className="h-3.5 w-3.5" />
          Fix Error Memory
        </>
      )}
    </Button>
  );
}
