"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/lib/types";

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password. Please try again.";
  if (message.includes("Email not confirmed"))
    return "Please confirm your email before signing in. Check your inbox.";
  if (message.includes("User already registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (message.includes("Password should be at least"))
    return "Password must be at least 6 characters.";
  if (message.includes("Unable to validate email address"))
    return "Please enter a valid email address.";
  if (message.includes("rate limit") || message.includes("too many requests"))
    return "Too many attempts. Please wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

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
      return { success: false, error: mapAuthError(error.message) };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Auth login exception:", err?.message ?? err);
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
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
      return { success: false, error: mapAuthError(error.message) };
    }

    if (!data.session) {
      return { success: true, error: "confirm_email" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Auth signup exception:", err?.message ?? err);
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}

export async function signout(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } catch (err: any) {
    console.error("Auth signout exception:", err?.message ?? err);
  }
}
