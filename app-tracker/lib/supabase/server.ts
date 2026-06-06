import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchWithTimeoutAndRetry } from "../fetch";
import { config } from "dotenv";

// Load .env.local first, then fall back to .env
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

// Lightweight in-process health-check cache to avoid running a network
// probe on every request (which causes noticeable latency).
let _lastHealthCheck = 0;
const HEALTH_CHECK_TTL = 60_000; // 60s

export async function createClient() {
  const cookieStore = await cookies();
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "Supabase client env vars missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE key is not set",
    );
  } else {
    if (
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.debug(
        "Using SUPABASE server secret key for createClient (service role).",
      );
    } else {
      console.debug(
        "Using NEXT_PUBLIC_SUPABASE_ANON_KEY for createClient (anon key).",
      );
    }
    try {
      const now = Date.now();
      if (now - _lastHealthCheck > HEALTH_CHECK_TTL) {
        _lastHealthCheck = now;
        const healthUrl = new URL("/auth/v1/health", SUPABASE_URL).toString();
        // Fire-and-forget health check so createClient doesn't block requests.
        fetchWithTimeoutAndRetry(healthUrl, { method: "GET" })
          .then((res) => {
            if (!res.ok) {
              console.warn(
                `Supabase health check returned status ${res.status} for ${SUPABASE_URL}`,
              );
            } else {
              console.debug(`Supabase health OK: ${SUPABASE_URL}`);
            }
          })
          .catch((err) => {
            console.error(
              `Supabase health check failed for ${SUPABASE_URL}:`,
              err?.message ?? err,
            );
          });
      }
    } catch (err) {
      console.error("Invalid NEXT_PUBLIC_SUPABASE_URL:", err);
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — cookies can't be set, middleware handles it
          }
        },
      },
    },
  );
}
