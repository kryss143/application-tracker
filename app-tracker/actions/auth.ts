"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/lib/types";

export async function login(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Auth login error:", error);
      return { success: false, error: error.message ?? String(error) };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Auth login exception:", err?.message ?? err);
    return { success: false, error: err?.message ?? String(err) };
  }
}

export async function signup(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Auth signup error:", error);
      return { success: false, error: error.message ?? String(error) };
    }

    // If email confirmation is required, session will be null
    if (!data.session) {
      return {
        success: true,
        error: "Check your email to confirm your account.",
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Auth signup exception:", err?.message ?? err);
    return { success: false, error: err?.message ?? String(err) };
  }
}

export async function signout(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    console.log("User signed out");
  } catch (err: any) {
    console.error("Auth signout exception:", err?.message ?? err);
  }
}
