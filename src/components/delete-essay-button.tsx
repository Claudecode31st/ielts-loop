"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteEssayButtonProps {
  essayId: string;
  /** Where to redirect after deletion. Defaults to /essays */
  redirectTo?: string;
  /** Visual variant */
  variant?: "icon" | "full";
}

export function DeleteEssayButton({
  essayId,
  redirectTo = "/essays",
  variant = "full",
}: DeleteEssayButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setError(false);
    try {
      const res = await fetch(`/api/essays/${essayId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(true);
      setIsDeleting(false);
    }
  }

  const trigger =
    variant === "icon" ? (
      <button
        className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
        title="Delete essay"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    ) : (
      <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 className="h-3.5 w-3.5" />
        Delete essay
      </button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this essay?</DialogTitle>
          <DialogDescription>
            This will permanently remove the essay and its feedback. Your AI error
            memory and score blockers will not be affected — they are built from
            all your past submissions combined.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
        )}
        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Yes, delete</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
