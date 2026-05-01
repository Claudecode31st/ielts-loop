"use client";

import { UpgradeButton } from "@/components/upgrade-button";
import { Zap } from "lucide-react";

interface EssayLimitBannerProps {
  used: number;
  limit: number;
  plan: string;
}

export function EssayLimitBanner({ used, limit, plan }: EssayLimitBannerProps) {
  if (plan === "pro") return null;

  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 100;
  const atLimit = used >= limit;

  if (atLimit) {
    return (
      <div className="bg-white border-l-4 border-brand-600 border border-[var(--border)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-600 shrink-0" />
            <p className="text-sm font-semibold text-slate-900">
              You&apos;ve used all {limit} free essays this month
            </p>
          </div>
          <p className="text-sm text-slate-500 pl-6">
            Upgrade to Pro for unlimited essays, priority processing, and full analytics.
          </p>
        </div>
        <UpgradeButton size="sm" className="bg-brand-600 hover:bg-brand-700 text-white border-0 shrink-0">
          Upgrade to Pro — $9/mo
        </UpgradeButton>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 font-medium">
          {used} of {limit} free essays used this month
        </span>
        <span className="text-slate-400 text-xs">{limit - used} remaining</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
