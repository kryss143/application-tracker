import { getApplications } from "@/actions/applications";
import StatsBar from "@/components/StatsBar";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const applications = await getApplications();

  return (
    <div className="px-4 md:px-8 py-6 max-w-400 mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-50 mb-1">
          Your Applications
        </h2>
        <p className="text-ink-400 text-sm">
          {applications.length === 0
            ? "Start tracking by adding your first application"
            : `Tracking ${applications.length} application${applications.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <StatsBar applications={applications} />

      {/* <div className="mt-8">
        <KanbanBoard initialApplications={applications} />
      </div> */}
    </div>
  );
}
