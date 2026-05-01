import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">
          {/* Writing Memory */}
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>

          {/* Recent Essays */}
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
                <div className="shrink-0 space-y-1">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-2.5 w-10" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-4 w-14 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <Skeleton className="h-3.5 w-full" />
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

        {/* Right col */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-20 mx-auto rounded-lg" />
              <Skeleton className="h-3 w-40 mx-auto" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="bg-white border border-[var(--border)] rounded-xl p-2 space-y-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
