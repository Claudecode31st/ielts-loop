import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3.5 w-60" />
      </div>

      {/* Avg scores */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-2 text-center">
            <Skeleton className="h-7 w-10 mx-auto" />
            <Skeleton className="h-2.5 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>

      {/* Error memory */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i !== 0 ? "border-t border-[var(--border)]" : ""}`}>
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
