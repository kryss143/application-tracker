// app/kanban/loading.tsx

import { Skeleton } from "@/components/Skeleton";
import { KanbanBoardSkeleton } from "@/components/KanbanBoardSkeleton";

export default function KanbanLoading() {
  return (
    <main className="max-w-400 mx-auto px-4 md:px-8 pt-24 pb-12">
      {/* Board heading */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <KanbanBoardSkeleton />
    </main>
  );
}
