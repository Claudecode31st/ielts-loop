import { Skeleton } from "@/components/ui/skeleton";

export default function EssayLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Back link */}
      <Skeleton className="h-4 w-28 rounded-lg" />

      {/* Score header card */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Big band score */}
          <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content: essay + tabs */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Essay text panel */}
        <div className="lg:col-span-3 bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/40">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${70 + ((i * 17) % 30)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Feedback tabs panel */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="px-5 py-3 border-b border-white/40 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>

          {/* Error list */}
          <div className="divide-y divide-white/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-14 rounded-full ml-auto" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
