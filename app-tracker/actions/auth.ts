"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/lib/types";

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true }; // ← no redirect()
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { success: false, error: error.message };

  // If email confirmation is required, session will be null
  if (!data.session) {
    return {
      success: true,
      error: "Check your email to confirm your account.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
