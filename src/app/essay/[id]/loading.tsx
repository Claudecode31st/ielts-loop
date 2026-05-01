import { Skeleton } from "@/components/ui/skeleton";

export default function EssayLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

      {/* Back link */}
      <Skeleton className="h-3.5 w-24 rounded" />

      {/* Score header */}
      <div className="bg-white border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-1.5">
              <Skeleton className="h-4 w-14 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-5 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Essay */}
        <div className="lg:col-span-3 bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="px-4 py-4 space-y-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-3.5" style={{ width: `${70 + ((i * 17) % 30)}%` }} />
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] flex gap-2">
            <Skeleton className="h-6 w-18 rounded-lg" />
            <Skeleton className="h-6 w-22 rounded-lg" />
            <Skeleton className="h-6 w-22 rounded-lg" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-[var(--border)] last:border-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-4 w-12 rounded ml-auto" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
