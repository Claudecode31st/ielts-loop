import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Band score chart card */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        {/* Chart area */}
        <Skeleton className="h-52 w-full rounded-xl" />
        {/* Legend */}
        <div className="flex gap-4 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Two-column stats */}
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Error memory section */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/40 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="divide-y divide-white/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
