// app/kanban/loading.tsx
import { Skeleton } from "@/components/Skeleton";
import { KanbanBoardSkeleton } from "@/components/KanbanBoardSkeleton";

function NavbarSkeleton() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm">
      <div className="max-w-400 mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Skeleton className="h-5 w-28" />

        {/* Right side: nav links + avatar */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16 hidden md:block" />
          <Skeleton className="h-4 w-16 hidden md:block" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function KanbanLoading() {
  return (
    <>
      <NavbarSkeleton />
      <main className="max-w-400 mx-auto px-4 md:px-8 pt-24 pb-12">
        {/* Board heading */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          {/* Add button */}
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        <KanbanBoardSkeleton />
      </main>
    </>
  );
}
