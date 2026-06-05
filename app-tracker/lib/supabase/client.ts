import { createBrowserClient } from "@supabase/ssr";
import { fetchWithTimeoutAndRetry } from "../fetch";

export async function createClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      `Missing Supabase env vars:\n` +
        `  NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? "✓" : "✗ MISSING"}\n` +
        `  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? "✓" : "✗ MISSING"}`,
    );
  }

  const client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // In browser, prefer to patch global fetch so Supabase and other libs use our wrapper.
  try {
    if (typeof window !== "undefined") {
      (globalThis as any).fetch = fetchWithTimeoutAndRetry as any;
    }
  } catch (__) {
    // ignore in restricted environments
  }

  return client;
}
