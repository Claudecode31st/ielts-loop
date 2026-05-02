"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, Zap, LogOut, Target, Trash2 } from "lucide-react";
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
        // Load saved target band if present
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
      setTimeout(() => setSaveSuccess(false), 3000);
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
    <div className="max-w-lg mx-auto px-4 py-10 space-y-3">

      {/* ── Account ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</p>
        </div>
        <div className="px-5 py-5 flex items-center gap-4">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="w-12 h-12 rounded-full shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center shrink-0 text-brand-600 font-bold text-lg">
              {session?.user?.name?.[0] ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{session?.user?.name}</p>
            <p className="text-sm text-slate-400 truncate">{session?.user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Signed in with Google</p>
          </div>
        </div>
        <div className="px-5 pb-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Plan ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</p>
        </div>
        <div className="px-5 py-5 flex items-center justify-between gap-4">
          <div>
            {plan === "pro" ? (
              <>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-brand-600" />
                  <p className="font-semibold text-slate-900">Pro</p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Unlimited essays · full analytics · priority AI</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-900">Free</p>
                <p className="text-xs text-slate-400 mt-0.5">2 essays per month · upgrade for unlimited access</p>
              </>
            )}
          </div>
          {plan === "pro" ? (
            <button
              onClick={handleManageBilling}
              disabled={isPortalLoading}
              className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isPortalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Manage billing"}
            </button>
          ) : (
            <Link
              href="/pricing"
              className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Settings</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          {/* Target band */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Target className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-sm font-medium text-slate-800">Target Band</p>
              </div>
              <p className="text-xs text-slate-400">
                Used to show how far you are from your goal on your dashboard.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
                className="text-sm font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>Band {b}</option>
                ))}
              </select>
              <button
                onClick={handleSaveTarget}
                disabled={isSaving}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <><CheckCircle className="h-3.5 w-3.5" /> Saved</>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="bg-white border border-red-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Danger Zone</p>
        </div>
        <div className="px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <p className="text-sm font-medium text-slate-800">Reset AI Memory</p>
            </div>
            <p className="text-xs text-slate-400">
              Clears all your error patterns and learning data. Your essays won&apos;t be deleted. Cannot be undone.
            </p>
          </div>
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger asChild>
              <button className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
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
                  {isResetting ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</> : "Yes, reset"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Footer links */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-6">
        <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</Link>
        <span className="text-slate-200">·</span>
        <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</Link>
      </div>
    </div>
  );
}
