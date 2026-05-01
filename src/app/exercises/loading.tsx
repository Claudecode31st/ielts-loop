import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Exercise cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-3/5" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
