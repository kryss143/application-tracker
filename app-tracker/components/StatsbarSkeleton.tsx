// components/StatsBarSkeleton.tsx
import { Skeleton } from "@/components/Skeleton";

export function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-ink-800 bg-ink-900 p-4 flex flex-col gap-2"
        >
          {/* Label */}
          <Skeleton className="h-3 w-20" />
          {/* Number */}
          <Skeleton className="h-7 w-10" />
        </div>
      ))}
    </div>
  );
}
