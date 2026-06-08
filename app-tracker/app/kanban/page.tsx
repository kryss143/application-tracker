// Kanban board page

import { createClient } from "@/lib/supabase/server";
import { getApplications } from "@/actions/applications";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const applications = await getApplications(supabase, user!.id);

  return (
    <main className="max-w-400 mx-auto px-4 md:px-8 py-8 pb-12">
      <KanbanBoard initialApplications={applications} />
    </main>
  );
}
