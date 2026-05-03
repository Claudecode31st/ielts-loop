"use client";
import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Small delay so fonts / layout paint first
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export function PrintCloseButton() {
  return (
    <div className="no-print mb-6 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Your browser will open a print dialog. Choose <strong>Save as PDF</strong>.
      </p>
      <button
        onClick={() => window.close()}
        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
      >
        ✕ Close
      </button>
    </div>
  );
}
