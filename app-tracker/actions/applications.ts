"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Application, ApplicationStatus, ActionResult } from "@/lib/types";

export async function getApplications(): Promise<Application[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return [];
  }

  return data as Application[];
}

export async function createApplication(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const payload = {
    user_id: user.id,
    company_name: formData.get("company_name") as string,
    job_title: formData.get("job_title") as string,
    status: (formData.get("status") as ApplicationStatus) || "wishlist",
    job_url: (formData.get("job_url") as string) || null,
    location: (formData.get("location") as string) || null,
    salary_range: (formData.get("salary_range") as string) || null,
    notes: (formData.get("notes") as string) || null,
    applied_date: (formData.get("applied_date") as string) || null,
    followup_date: (formData.get("followup_date") as string) || null,
  };

  const { error } = await supabase.from("applications").insert(payload);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplication(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const payload = {
    company_name: formData.get("company_name") as string,
    job_title: formData.get("job_title") as string,
    status: formData.get("status") as ApplicationStatus,
    job_url: (formData.get("job_url") as string) || null,
    location: (formData.get("location") as string) || null,
    salary_range: (formData.get("salary_range") as string) || null,
    notes: (formData.get("notes") as string) || null,
    applied_date: (formData.get("applied_date") as string) || null,
    followup_date: (formData.get("followup_date") as string) || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("applications")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
