import { Skeleton } from "@/components/ui/skeleton";

export default function EssaysLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      {/* Essay cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-5 space-y-4"
        >
          {/* Top row: badges + score */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-14 rounded-xl shrink-0" />
          </div>

          {/* Essay prompt excerpt */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Sub-scores row */}
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
