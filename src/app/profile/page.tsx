"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Target, Brain, LogOut, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { MemoryInsights } from "@/components/memory-insights";
import type { StudentMemoryContext } from "@/types";

const BAND_OPTIONS = [
  "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0",
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [memory, setMemory] = useState<StudentMemoryContext | null>(null);
  const [targetBand, setTargetBand] = useState("7.0");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/memory");
      if (res.ok) {
        const data = await res.json();
        setMemory(data);
      }
    }
    loadData();
  }, []);

  async function handleSaveTarget() {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/profile/target-band", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetBand: parseFloat(targetBand) }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetMemory() {
    setIsResetting(true);
    try {
      await fetch("/api/memory", { method: "DELETE" });
      setMemory({
        recentScores: [],
        topErrorPatterns: [],
        vocabularyStats: [],
        memoryProfile: null,
      });
      setResetOpen(false);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <User className="h-7 w-7 text-indigo-600" />
          My Profile
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          {/* Account Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-16 h-16 rounded-full mx-auto"
                />
              )}
              <div className="text-center">
                <p className="font-semibold text-slate-900">
                  {session?.user?.name}
                </p>
                <p className="text-sm text-slate-500">{session?.user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Target Band */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-amber-500" />
                Target Band
              </CardTitle>
              <CardDescription>
                Set your IELTS target to help calibrate feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="targetBand">Target Band Score</Label>
                <Select value={targetBand} onValueChange={setTargetBand}>
                  <SelectTrigger id="targetBand">
                    <SelectValue placeholder="Select target band" />
                  </SelectTrigger>
                  <SelectContent>
                    {BAND_OPTIONS.map((band) => (
                      <SelectItem key={band} value={band}>
                        Band {band}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveTarget}
                disabled={isSaving}
                size="sm"
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Saved!
                  </>
                ) : (
                  "Save Target"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Reset Memory */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <Trash2 className="h-4 w-4" />
                Reset Memory
              </CardTitle>
              <CardDescription>
                Clear all error patterns and learning data. This cannot be
                undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    Reset My Learning Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Learning Profile?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your error patterns,
                      vocabulary stats, and learning data. Your essay history
                      will remain. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setResetOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleResetMemory}
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Yes, Reset Profile"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Memory Profile */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Learning Profile
            </h2>
          </div>
          {memory ? (
            <MemoryInsights memory={memory} />
          ) : (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
