"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, Zap, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";

const BAND_OPTIONS = ["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [targetBand, setTargetBand] = useState("7.0");
  const [isSaving, setIsSaving]     = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetOpen, setResetOpen]   = useState(false);
  const [plan, setPlan]             = useState<"free" | "pro">("free");
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [memRes, usageRes] = await Promise.all([
        fetch("/api/memory"),
        fetch("/api/usage"),
      ]);
      if (memRes.ok) {
        const mem = await memRes.json();
        if (mem?.targetBand) setTargetBand(String(mem.targetBand));
      }
      if (usageRes.ok) {
        const u = await usageRes.json();
        setPlan(u.plan === "pro" ? "pro" : "free");
        if (u.targetBand) setTargetBand(String(u.targetBand));
      }
    }
    load();
  }, []);

  async function handleSaveTarget() {
    setIsSaving(true); setSaveSuccess(false);
    try {
      await fetch("/api/profile/target-band", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetBand: parseFloat(targetBand) }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally { setIsSaving(false); }
  }

  async function handleManageBilling() {
    setIsPortalLoading(true);
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setIsPortalLoading(false); }
  }

  async function handleResetMemory() {
    setIsResetting(true);
    try {
      await fetch("/api/memory", { method: "DELETE" });
      setResetOpen(false);
    } finally { setIsResetting(false); }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-md space-y-2">

        {/* ── Profile header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="w-11 h-11 rounded-full shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center shrink-0 font-bold text-brand-600">
              {session?.user?.name?.[0] ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate leading-tight">{session?.user?.name}</p>
            <p className="text-sm text-slate-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        {/* ── Settings card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">

          {/* Plan row */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800">Plan</p>
                {plan === "pro" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                    <Zap className="h-2.5 w-2.5" /> Pro
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Free</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {plan === "pro" ? "Unlimited essays · full analytics · priority AI" : "2 essays per month"}
              </p>
            </div>
            {plan === "pro" ? (
              <button
                onClick={handleManageBilling}
                disabled={isPortalLoading}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {isPortalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Manage billing"}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Upgrade →
              </Link>
            )}
          </div>

          {/* Target band row */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">Target Band</p>
              <p className="text-xs text-slate-400 mt-0.5">Sets your goal on the dashboard progress bars</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>Band {b}</option>
                ))}
              </select>
              <button
                onClick={handleSaveTarget}
                disabled={isSaving || saveSuccess}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center gap-1.5 min-w-[52px] justify-center"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : saveSuccess ? <><CheckCircle className="h-3.5 w-3.5" /> Saved</>
                  : "Save"}
              </button>
            </div>
          </div>

          {/* Reset row */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">Reset AI Memory</p>
              <p className="text-xs text-slate-400 mt-0.5">Wipes your score blockers and error history. Does not delete your essays. Cannot be undone.</p>
            </div>
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
              <DialogTrigger asChild>
                <button className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  Reset
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset AI Memory?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all your error patterns and learning data.
                    Your essay history will stay. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <button
                    onClick={() => setResetOpen(false)}
                    className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetMemory}
                    disabled={isResetting}
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isResetting ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</> : <><Trash2 className="h-4 w-4" /> Yes, reset</>}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-4 pt-3">
          <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy</Link>
          <span className="text-slate-300">·</span>
          <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Terms</Link>
        </div>

      </div>
    </div>
  );
}
