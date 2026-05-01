import { Skeleton } from "@/components/ui/skeleton";

export default function EssaysLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Essay list */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex items-start gap-4 px-4 py-3.5 ${i !== 0 ? "border-t border-[var(--border)]" : ""}`}>
            <div className="shrink-0 w-12 space-y-1 text-right">
              <Skeleton className="h-6 w-10 ml-auto" />
              <Skeleton className="h-2.5 w-10 ml-auto" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-1.5">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-14 rounded" />
              </div>
              <Skeleton className="h-3.5 w-3/4" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-10" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
