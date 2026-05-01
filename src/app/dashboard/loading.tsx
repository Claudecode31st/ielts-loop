import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome bar */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl border-l-4 border-l-brand-600 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Writing Memory */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="divide-y divide-white/40">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-10 rounded-full" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Essays */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/40">
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="divide-y divide-white/40">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-12 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            {/* Band Progress */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-5 space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="text-center space-y-2">
                <Skeleton className="h-16 w-24 mx-auto rounded-xl" />
                <Skeleton className="h-3 w-40 mx-auto" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>

            {/* Coaching card */}
            <Skeleton className="h-40 w-full rounded-2xl" />

            {/* Quick Actions */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
