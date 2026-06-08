// app/dashboard/loading.tsx
import { Skeleton } from "@/components/Skeleton";
import { StatsBarSkeleton } from "@/components/StatsbarSkeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-400 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-56 mt-5 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Stats bar */}
      <StatsBarSkeleton />

      {/* Application cards placeholder */}
      <div className="mt-8 grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-ink-800 bg-ink-900 p-4 flex items-center gap-4"
          >
            {/* Company logo placeholder */}
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />

            <div className="flex-1 flex flex-col gap-2 min-w-0">
              {/* Role + company */}
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Status badge */}
            <Skeleton className="h-6 w-20 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
