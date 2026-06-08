// Kanban board page

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplications } from "@/actions/applications";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const applications = await getApplications(supabase, user.id);

  return (
    <>
      <Navbar userEmail={user.email ?? ""} />
      <main className="max-w-400 mx-auto px-4 md:px-8 pt-24 pb-12">
        <KanbanBoard initialApplications={applications} />
      </main>
    </>
  );
}
