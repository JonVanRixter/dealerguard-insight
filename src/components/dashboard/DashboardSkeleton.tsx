import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 mt-1.5" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dealer Watchlist */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex gap-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-40" />
            </div>
          </div>
          <div className="px-5 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <Skeleton className="w-7 h-7 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-1" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
