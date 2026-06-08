// components/KanbanBoardSkeleton.tsx
import { Skeleton } from "@/components/Skeleton";

// Vary card counts per column to feel natural, not grid-like
const COLUMNS = [
  { label: "Wishlist", cards: 3 },
  { label: "Applied", cards: 5 },
  { label: "Interview", cards: 2 },
  { label: "Offer", cards: 1 },
  { label: "Rejected", cards: 4 },
];

function KanbanCardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-3 flex flex-col gap-2">
      {/* Company logo + name row */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-md shrink-0" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Role title */}
      <Skeleton className="h-4 w-36" />
      {/* Date chip */}
      <Skeleton className="h-3 w-16 mt-1" />
    </div>
  );
}

function KanbanColumnSkeleton({
  label,
  cards,
}: {
  label: string;
  cards: number;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-60 w-60">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: cards }).map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <KanbanColumnSkeleton
          key={col.label}
          label={col.label}
          cards={col.cards}
        />
      ))}
    </div>
  );
}
