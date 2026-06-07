"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

type State = "loading" | "success" | "error";

export default function ConfirmPage() {
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
    let subscription: { unsubscribe: () => void } | null = null;

    // Define async function and call it immediately
    const checkSession = async () => {
      supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setState("success");
        return;
      }

      // Check for error in URL hash
      const hash = window.location.hash;
      if (hash.includes("error=")) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const desc = params.get("error_description") ?? "Confirmation failed.";
        setErrorMsg(
          desc.includes("expired")
            ? "This confirmation link has expired. Please sign up again."
            : desc.includes("already")
              ? "This email has already been confirmed. You can sign in."
              : "Something went wrong. Please try signing up again.",
        );
        setState("error");
        return;
      }

      // Listen for auth state change (token arrives via URL fragment)
      const { data } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          if (
            (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
            session
          ) {
            setState("success");
          }
        },
      );

      subscription = data.subscription ?? null;
    };

    checkSession();

    // Cleanup listener on unmount
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Redirect when confirmed
  useEffect(() => {
    if (state === "success") {
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-ink-950 bg-grid flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink-800 border border-ink-700 mb-5 shadow-card">
            <Briefcase className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-50 mb-1">
            JobLedger
          </h1>
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-10 shadow-card text-center">
            <Loader2 className="w-10 h-10 text-gold-400 animate-spin mx-auto mb-4" />
            <p className="text-ink-300 text-sm">
              Verifying your email address…
            </p>
          </div>
        )}

        {/* Success */}
        {state === "success" && (
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-card text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto">
              <CheckCircle
                className="w-8 h-8 text-emerald-400"
                strokeWidth={1.5}
              />
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-ink-50 mb-2">
                Email confirmed!
              </h2>
              <p className="text-sm text-ink-400 leading-relaxed">
                Your email address has been verified and your JobLedger account
                is now active. You're all set to start tracking your job search.
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300 text-left">
                Account activated — you can now sign in
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold py-3 rounded-xl transition-all duration-200 group"
            >
              Go to dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <p className="text-xs text-ink-500">
              Already signed in? You'll be redirected automatically.
            </p>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-card text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mx-auto">
              <XCircle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-ink-50 mb-2">
                Confirmation failed
              </h2>
              <p className="text-sm text-ink-400 leading-relaxed">
                {errorMsg ??
                  "This confirmation link is invalid or has expired."}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/signup")}
                className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold py-3 rounded-xl transition-all duration-200 group"
              >
                Sign up again
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 rounded-xl text-sm text-ink-400 hover:text-ink-200 transition-colors"
              >
                Already confirmed? Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
